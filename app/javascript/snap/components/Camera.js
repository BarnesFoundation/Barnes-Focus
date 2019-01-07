import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import withOrientation from './withOrientation';
import scan_button from 'images/scan-button.svg';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import barnes_logo from 'images/logo.svg';
import {
    SNAP_LANGUAGE_PREFERENCE, SNAP_ATTEMPTS, GA_EVENT_CATEGORY, GA_EVENT_ACTION,
    GA_EVENT_LABEL, SNAP_LAST_TIMESTAMP, SNAP_COUNT_RESET_INTERVAL, SNAP_APP_RESET_INTERVAL, SNAP_USER_EMAIL, SNAP_LANGUAGE_TRANSLATION,
    CATCHOOM_ACCESS_TOKEN, CATCHOOM_REQUEST_URL, ART_WORK_INFO_URL
} from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';
import * as analytics from './Analytics';

class Camera extends Component {

    translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);

    // Set state variables
    state = {
        videoStream: null,
        frontCamera: false,
        showVideo: true,
        searchInProgress: false,
        snapAttempts: localStorage.getItem(SNAP_ATTEMPTS) || 0,
        translation: (this.translationObj) ? JSON.parse(this.translationObj) : null,
        cameraPermission: false,
        scanSeqId: Date.now(),
        matchError: false
    };

    // Set booleans and counter
    artworkRetrieved = false; matchFound = false; responseCounter = 0; intervalExecutions;

    track; camera_capabilities; camera_settings; scan; cropRect;

    resetSnapCounter = () => {
        let last_snap_timestamp = parseInt(localStorage.getItem(SNAP_LAST_TIMESTAMP));
        if (last_snap_timestamp) {
            let ttl = (last_snap_timestamp + parseInt(SNAP_COUNT_RESET_INTERVAL)) - Date.now();
            if (ttl <= 0 && this.state.snapAttempts > 0) {
                localStorage.removeItem(SNAP_ATTEMPTS);
                this.setState({ snapAttempts: 0 });
            }
        }
    }

    /** Crops an image and returns the uri of the cropped image */
    cropPhoto = (imageUri) => {
        return new Promise(resolve => {

            let image = new Image();
            image.onload = () => {

                // let scanBox = this.scanBox.getBoundingClientRect();
                /* this.cropRect = {
                    x: Math.floor(scanBox.x),
                    y: Math.floor(scanBox.y),
                    width: Math.floor(scanBox.width),
                    height: Math.floor(scanBox.height)
                } */

                var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

                // We will be croping the top half of entire viewport for better image matching.
                this.cropRect = {
                    x: 0,
                    y: 0,
                    width: screen.width,
                    height: h / 2
                }

                // Create temporary canvas
                let cropCanvas = document.createElement('canvas');
                let cropContext = cropCanvas.getContext('2d');

                let cropWidth = Math.floor(this.cropRect.width);
                let cropHeight = Math.floor(this.cropRect.height);

                cropCanvas.width = cropWidth;
                cropCanvas.height = cropHeight;

                // Draw the new image, keeping its proportions intact for optimal matching
                cropContext.drawImage(image, this.cropRect.x, this.cropRect.y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

                // image = cropCanvas.toDataURL('image/jpeg', 1.0);
                cropCanvas.toBlob((imageBlob) => {
                    resolve(imageBlob);
                }, 'image/jpeg');
            }
            // Trigger loading of the image
            image.src = imageUri;
        });
    }

    stopScan = () => {
        // End the photo scan 
        clearInterval(this.scan);
        this.scan = null;
    }

    /** Captures photo over a 3-second duration */
    capturePhotoShots = () => {

        // Track on Google Analytics that a photo was captured
        analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.TAKE_PHOTO, eventLabel: GA_EVENT_LABEL.SNAP_BUTTON });

        // Update the snap attempts with this scan as a single attempt
        localStorage.setItem(SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        localStorage.setItem(SNAP_LAST_TIMESTAMP, Date.now());

        let prefLang = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || "en";
        this.intervalExecutions = 0;

        this.stopScan();
        // Capture a photo scan every third of a second
        this.scan = setInterval(() => {
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
                        let imageCrop = await this.cropPhoto(imageUri);

                        window.URL.revokeObjectURL(imageUri);
                        this.prepareServerRequest(imageCrop);
                    }

                    else {
                        this.prepareServerRequest(imageBlob);
                    }
                }, 'image/jpeg');
            }
        }, 1000 / 3);
    }

    /** Prepares image match request options */
    prepareServerRequest = (imageData) => {

        let url, data, config;
        // Configurations for Axios request
        let token = CATCHOOM_ACCESS_TOKEN;

        url = CATCHOOM_REQUEST_URL;
        data = new FormData();
        config = { headers: { 'Content-Type': 'multipart/form-data' } };

        // Append form data    
        data.append('token', token);
        data.append('image', imageData, 'temp_image.jpg');
        data.append('scanSeqId', this.state.scanSeqId);

        this.submitSearchRequest(url, data, config)
    }

    /** Submits the image search request to the server */
    submitSearchRequest = async (url, data, config) => {
        try {
            let response = await axios.post(url, data, config)
            // Increment our response counter
            this.responseCounter++;
            let searchTime = response.data.search_time;
            // If a match was found
            if (response.data.results.length > 0 && this.matchFound == false) {
                this.processImageMatch(response, data, searchTime);
            }
            // If we've received all responses and no match was found yet, process as a non-matched image
            else {
                if (!this.matchFound) {
                    this.storeSearchedResult(false, data, null, null, searchTime);
                }
                if (!this.matchFound && (this.responseCounter == 9 || this.intervalExecutions == 9)) {
                    this.completeImageSearchRequest(false, null)
                }
            }
        }
        catch (error) {
            // Store the image even if catchoom request fails.
            this.storeSearchedResult(false, data, null, null, null);
            // End the photo scan 
            if (this.intervalExecutions == 9) {
                this.handleSnapFailure();
            }
        }
    }

    /** Closure function so that a image match response is processed only once */
    processImageMatch = ((response, data, searchTime) => {
        let executed = false;
        return async (response, data, searchTime) => {
            if (!executed) {
                executed = true;

                this.matchFound = true;

                this.stopScan();

                // Get the image id
                let imageId = response.data.results[0].item.name
                let refImage = response.data.results[0].image.thumb_120;

                // Show the search animation while retrieving artwork information
                this.setState({ searchInProgress: true, showVideo: false });
                let artworkInfo = await this.getArtworkInformation(imageId);
                this.setState({ searchInProgress: false });

                this.storeSearchedResult(true, data, refImage, artworkInfo, searchTime);
                this.completeImageSearchRequest(true, artworkInfo);

            }
        };
    })();

    /** Retrieves the information for the identified piece */
    getArtworkInformation = async (imageId) => {

        this.artworkRetrieved = true;
        try {
            let response = await axios.get(ART_WORK_INFO_URL + imageId);
            return response.data;
        }
        catch (error) { console.log('An error occurred while retrieving the artwork information from the server'); }
    }

    /** Stores the search attempt in the server */
    storeSearchedResult = async (searchSuccess, formData, referenceImageUrl, esResponse, searchTime) => {

        formData.append('searchSuccess', searchSuccess);
        formData.append('referenceImageUrl', referenceImageUrl);
        formData.append('esResponse', JSON.stringify(esResponse));
        formData.append('searchTime', searchTime)

        await axios.post('/api/snaps/storeSearchedResult', formData);
    }

    /** Processes the completion of an image search */
    completeImageSearchRequest(responseFound, response) {
        console.log('You SHOULD see me for each scan session whether success or failure!');
        // Turn off the search-in-progress animation
        if (this.state.searchInProgress) {
            this.setState({ searchInProgress: false });
        }

        if (responseFound) {
            // Update analytics of the successful snap event
            analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_SUCCESS, eventLabel: GA_EVENT_LABEL.SNAP_SUCCESS });

            // Navigate to results page
            this.props.history.push({ pathname: '/results', state: { result: response, snapCount: localStorage.getItem(SNAP_ATTEMPTS) } });
        }
        else {
            this.handleSnapFailure();
        }
    }

    /** Provides the snap failure event to Google Analytics */
    handleSnapFailure = () => {
        this.stopScan();
        // Turn off search in-progress animation
        if (this.state.searchInProgress) { this.setState({ searchInProgress: false }); }

        if (!this.state.matchError) {
            this.setState({ matchError: true });
        }

    }

    componentDidMount() {
        // Fetch the device camera
        navigator.mediaDevices.getUserMedia({
            video: {
                "facingMode": (this.state.frontCamera) ? "user" : "environment",
                "width": 1920,
                "height": 1080
            }
        })
            .then(videoStream => {
                this.setState({ videoStream: videoStream, cameraPermission: true });
            })
            .catch(error => {
                console.log('Not allowed to access camera. Please check settings! ' + error);
                this.setState({ error: "An error occurred accessing the device camera" });
            });

    }

    componentDidUpdate() {
        this.matchFound = false;
        this.responseCounter = 0;
        this.artworkRetrieved = false;

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
            // this.resetSnapCounter();
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

    /**
     * Draws the portion of the video visible within the preview onto a canvas, in a loop.
     */
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

    handleScan = () => {
        console.log('Back to scan mode');
        this.setState({ matchError: false, scanSeqId: Date.now() });
        this.capturePhotoShots();
    }

    render() {
        let videoStyle = {
            filter: `blur(25px)`,
            transform: `scale(1.2)`
        }
        return (
            <div className="camera-container" >
                <div className="camera">
                    {
                        this.state.showVideo &&
                        <div>
                            <video id="video" ref={c => this.video = c} width="100%" autoPlay playsInline muted style={videoStyle} />
                            {
                                !this.state.matchError &&
                                <canvas id="video-preview" ref={el => this.vpreview = el}></canvas>

                            }
                            {this.state.matchError &&
                                <div id="no-match-overlay" className="no-match-overlay">
                                    <div className="hint">
                                        <span>No results found. </span>
                                        <span>Click on the scan button to bring the art back into focus.</span>
                                    </div>
                                    <div className="scan-button" onClick={this.handleScan} style={{ position: 'absolute', bottom: '37px' }}>
                                        <img src={scan_button} alt="scan" />
                                    </div>
                                </div>
                            }

                        </div>
                    }

                    {/* ========= Search in progress screen ============ */
                        this.state.searchInProgress &&
                        <div>
                            <nav className="narbar header">
                                <a className="navbar-brand">
                                    <img src={barnes_logo} alt="Barnes" />
                                </a>
                            </nav>
                            <div className="search-progress-container">
                                <div className="snap-spinner">
                                    <PulseLoader
                                        color={'#999999'}
                                        size={20}
                                        margin={'5px'}
                                        loading={this.state.searchInProgress}
                                    />
                                </div>
                                <div className="content">
                                    <h1>{(this.state.translation) ? this.state.translation.Snap_searching.text_1.translated_content : `Searching`}</h1>
                                    <p>{(this.state.translation) ? this.state.translation.Snap_searching.text_2.translated_content : `Please wait while we search our database.`}</p>
                                </div>
                            </div>
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