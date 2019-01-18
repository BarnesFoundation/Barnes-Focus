import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import withOrientation from './withOrientation';
import scan_button from 'images/scan-button.svg';
import axios from 'axios';
import * as constants from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';
import { cropPhoto } from './CameraHelper';
import { SearchRequestService } from '../services/SearchRequestService';

class Camera extends Component {

    sr;
    translation;
    snapAttempts;

    state;

    matchFound;
    responseCounter;
    intervalExecutions

    track;
    camera_capabilities;
    camera_settings;
    scan;
    cropRect;


    constructor() {
        super();

        this.sr = new SearchRequestService();

        // Get from local storage
        this.translation = localStorage.getItem(constants.SNAP_LANGUAGE_TRANSLATION);
        this.snapAttempts = localStorage.getItem(constants.SNAP_ATTEMPTS) || 0;

        // Set state variables
        this.state = {
            videoStream: null,
            frontCamera: false,
            showVideo: true,
            searchInProgress: false,
            snapAttempts: this.snapAttempts,
            translation: (this.translationObj) ? JSON.parse(this.translationObj) : null,
            cameraPermission: false,
            scanSeqId: Date.now(),
            matchError: false
        };

        // Set flag and counter
        this.matchFound = false;
        this.responseCounter = 0;
    }

    resetSnapCounter = () => {
        let last_snap_timestamp = parseInt(localStorage.getItem(constants.SNAP_LAST_TIMESTAMP));
        if (last_snap_timestamp) {
            let ttl = (last_snap_timestamp + parseInt(constants.SNAP_COUNT_RESET_INTERVAL)) - Date.now();
            if (ttl <= 0 && this.state.snapAttempts > 0) {
                localStorage.removeItem(constants.SNAP_ATTEMPTS);
                this.setState({ snapAttempts: 0 });
            }
        }
    }

    stopScan = () => {
        // End the photo scan 
        clearInterval(this.scan);
        this.scan = null;
    }

    /** Captures photo over a 3-second duration */
    capturePhotoShots = () => {

        // Update the snap attempts with this scan as a single attempt
        localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

        let prefLang = localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE) || "en";
        this.intervalExecutions = 0;

        this.stopScan();

        // Capture a photo scan every third of a second
        this.scan = setInterval((this.scanner), 1000 / 3);
    }

    /** Contains the logic for capturing scans */
    scanner = () => {
        this.intervalExecutions++;
        if (this.intervalExecutions == 9) {
            this.stopScan();
        }
        // Only capture if a match hasn't already been found
        if (!this.matchFound) {

            // Get the the present image in the canvas and crop the image
            let canvas = this.getVideoCanvas();

            canvas.toBlob(async (imageBlob) => {

                if (process.env.CROP_IMAGE === 'TRUE') {

                    window.URL = window.URL || window.webkitURL;
                    let imageUri = window.URL.createObjectURL(imageBlob);
                    let imageCrop = await cropPhoto(imageUri);

                    window.URL.revokeObjectURL(imageUri);
                    const requestConfig = this.sr.prepareRequest(imageCrop, this.state.scanSeqId);
                    this.submitSearchRequest(requestConfig);
                }

                else {
                    const requestConfig = this.sr.prepareRequest(imageCrop, this.state.scanSeqId);
                    this.submitSearchRequest(requestConfig);
                }
            }, 'image/jpeg');
        }
    }

    /** Submits the image search request to the server */
    submitSearchRequest = async (requestConfig) => {

        const { data } = requestConfig;
        let response;

        let searchSuccess;
        let referenceImageUrl = null;
        let esResponse = null;
        let searchTime = null;

        if (this.matchFound == false) {

            try {
                // A match/no match will always have a search time
                response = await axios(requestConfig);
                searchTime = response.data.search_time;

                // If a match was found
                if (response.data.results.length > 0) {
                    this.matchFound = true;
                    let matchData = await this.processImageMatch(response);

                    searchSuccess = true;
                    esResponse = matchData.esResponse;
                    referenceImageUrl = matchData.referenceImageUrl;

                    this.completeImageSearchRequest(searchSuccess, esResponse);
                }

                else {
                    searchSuccess = false;
                }
            }

            catch (error) {
                searchSuccess = false;
            }

            finally {
                this.responseCounter++;

                // Store the result, regardless of success or not
                this.sr.storeSearchedResult(searchSuccess, data, referenceImageUrl, esResponse, searchTime);

                // Complete this image search attempt if we've received 9 responses or match was found
                if (this.responseCounter == 9) {
                    this.completeImageSearchRequest(searchSuccess, esResponse);
                }
            }
        }
    }

    /** Closure function so that a image match response is processed only once */
    processImageMatch = ((response) => {
        let executed = false;
        return async (response) => {
            if (!executed) {
                executed = true;

                // Get the image id
                let imageId = response.data.results[0].item.name
                let referenceImageUrl = response.data.results[0].image.thumb_120;

                // Retrieve artwork information
                let artworkInfo = await this.sr.getArtworkInformation(imageId);

                return { esResponse: artworkInfo, referenceImageUrl: referenceImageUrl };
            }
        };
    })();

    /** Processes the completion of an image search */
    completeImageSearchRequest(searchSuccess, response) {

        if (searchSuccess) {
            // Navigate to results page
            this.props.history.push({ pathname: `/results/${response["data"]["records"][0].id}`, state: { result: response, snapCount: localStorage.getItem(constants.SNAP_ATTEMPTS) } });
        }
        else {
            this.handleSnapFailure();
        }
    }

    /** Transitions to an alert screen when no match is found */
    handleSnapFailure = () => {
        this.stopScan();

        if (!this.state.matchError) {
            this.setState({ matchError: true });
        }

    }

    async componentDidMount() {
        // Fetch the device camera
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    "facingMode": (this.state.frontCamera) ? "user" : "environment",
                    "width": 1920,
                    "height": 1080
                }
            });
            this.setState({ videoStream: videoStream, cameraPermission: true });
        }

        catch (error) {
            this.setState({ error: "An error occurred accessing the device camera" });
        }
    }

    componentDidUpdate() {
        this.matchFound = false;
        this.responseCounter = 0;

        // When video is able to be captured
        if (this.state.showVideo && this.state.videoStream && !this.state.matchError) {
            console.log('Component updated');

            this.video.srcObject = this.state.videoStream;

            this.video.play()
                .then(() => {

                    this.track = this.state.videoStream.getVideoTracks()[0];
                    this.camera_capabilities = this.track.getCapabilities();
                    this.camera_settings = this.track.getSettings();
                    requestAnimationFrame(this.drawVideoPreview);
                    this.capturePhotoShots();
                })
                .catch((error) => {
                    console.log('Cannot auto play video stream! ' + error);
                });


            // Reset snap attemps count if last_snap_timestamp is 12 hours or before.
            this.resetSnapCounter();
        }
    }

    /** Gets the video drawn onto the canvas */
    getVideoCanvas = () => {

        // Get the canvas
        let canvas = this.getCanvas();
        const context = canvas.getContext("2d");

        if (isIOS || !this.camera_capabilities) {

            // Draw rectangle
            let rect = this.video.getBoundingClientRect();
            let tempCanvas = document.createElement('canvas');
            let tempCtx = tempCanvas.getContext('2d');

            // Draw the video onto a temporary canvas
            tempCanvas.width = rect.width;
            tempCanvas.height = rect.height;
            tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);

            // Now copy the viewport image onto our original canvas
            let x = (rect.x < 0) ? -(rect.x) : rect.x;
            let y = (rect.y < 0) ? -(rect.y) : rect.y;

            if (x > 0 && y > 0) {
                context.drawImage(tempCanvas, Math.floor(x), Math.floor(y), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            }

            else {
                context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            }
        }

        else {
            context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        }
        return canvas;
    }

    /** Gets a blank canvas of same size as the video */
    getCanvas = () => {
        const video = this.video;
        if (!video.videoHeight) return null;

        if (!this.ctx) {
            const canvas = document.createElement('canvas');
            const aspectRatio = video.videoWidth / video.videoHeight;

            canvas.width = video.clientWidth;
            canvas.height = video.clientWidth / aspectRatio;

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
        }

        const { ctx, canvas } = this;

        return canvas;
    }

    /** Draws the portion of the video visible within the preview onto a canvas, in a loop. */
    drawVideoPreview = () => {
        let previewCanvas = this.vpreview;
        let previewContext = previewCanvas.getContext('2d');
        let previewBox = this.vpreview.getBoundingClientRect();

        let rect = this.video.getBoundingClientRect();
        let tempCanvas = document.createElement('canvas');
        let tempCtx = tempCanvas.getContext('2d');

        // Draw the video onto a temporary canvas
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
        tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);

        this.cropRect = {
            x: Math.floor(previewBox.x),
            y: Math.floor(previewBox.y),
            width: Math.floor(previewBox.width),
            height: Math.floor(previewBox.height)
        }

        previewCanvas.width = this.cropRect.width;
        previewCanvas.height = this.cropRect.height;

        previewContext.drawImage(tempCanvas, this.cropRect.x, this.cropRect.y, this.cropRect.width, this.cropRect.height, 0, 0, previewCanvas.width, previewCanvas.height);

        requestAnimationFrame(this.drawVideoPreview);

    }

    /** Transitions the alert screen back to camera focus when scan button is clicked */
    handleScan = () => {
        console.log('Back to scan mode');
        this.setState({ matchError: false, scanSeqId: Date.now() });
        this.capturePhotoShots();
    }

    render() {

        const { showVideo, matchError } = this.state;

        let videoStyle = {
            filter: `blur(25px)`,
            transform: `scale(1.2)`
        }


        return (

            <div className="camera-container" >
                <div className="camera">
                    {
                        showVideo &&
                        <div>
                            <video id="video" ref={c => this.video = c} width="100%" autoPlay playsInline muted style={videoStyle} />
                            {
                                !matchError &&
                                <canvas id="video-preview" ref={el => this.vpreview = el}></canvas>

                            }
                            {matchError &&
                                <div id="no-match-overlay" className="no-match-overlay">
                                    <div className="hint h2">
                                        <span>No results found. <br /> Use the scan button to <br /> focus on a work of art.</span>
                                    </div>
                                    <div className="scan-button" onClick={this.handleScan} style={{ position: 'absolute', bottom: '37px' }}>
                                        <img src={scan_button} alt="scan" />
                                    </div>
                                </div>
                            }

                        </div>
                    }

                </div>
            </div>
        );
    }
}

export default compose(
    withOrientation,
    withRouter
)(Camera);