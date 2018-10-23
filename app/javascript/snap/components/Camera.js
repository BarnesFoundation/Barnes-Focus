import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Hammer from 'hammerjs';
import CameraControls from './CameraControls';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import barnes_logo from 'images/logo.svg';
import { sampleImage, SNAP_LANGUAGE_PREFERENCE, SNAP_ATTEMPTS, GA_EVENT_CATEGORY, GA_EVENT_ACTION, GA_EVENT_LABEL, SNAP_LAST_TIMESTAMP, SNAP_COUNT_RESET_INTERVAL, SNAP_APP_RESET_INTERVAL, SNAP_USER_EMAIL, SNAP_LANGUAGE_TRANSLATION } from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';
import * as analytics from './Analytics';


class Camera extends Component {

    translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);

    state = {
        videoStream: null,
        frontCamera: false,
        capturedImage: null,
        showVideo: true,
        searchInProgress: false,
        snapAttempts: localStorage.getItem(SNAP_ATTEMPTS) || 0,
        translation: (this.translationObj) ? JSON.parse(this.translationObj) : null
    };

    ticking = false; requestComplete = false; responseCounter = 0; scan; matchFound = false;
    track; camera_capabilities; camera_settings; initZoom; zoomLevel;

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

    cancelCamera = () => {
        this.props.history.push({
            pathname: '/',
            state: { cameraCancelled: true }
        });
    }

    /** Toggles the captured image being shown */
    toggleImage = (show) => {

        // Shows the image
        if (show) {
            this.img.style.visibility = 'visible';
            this.img.style.display = 'block';
        }
        // Hides the image
        else {
            this.img.src = '';
            this.img.style.visibility = 'hidden';
            this.img.style.display = 'none';
        }
    }

    /** Crops an image and returns the uri of the cropped image */
    cropPhoto = (imageUri) => {
        return new Promise(resolve => {

            let image = new Image();
            image.onload = function (event) {

                // Create temporary canvas
                let canvas1 = document.createElement('canvas');
                let context1 = canvas1.getContext('2d');

                // Get the center of the image for center-oriented cropping
                let xCenter = image.width / 2;
                let yCenter = image.height / 2;

                // Section the height and width into quarter segments
                let heightSeg = image.height / 4;
                let widthSeg = image.width / 4;

                // Set the width and height for the cropped image to 2.5 of their respective segments from the origin 
                let cWidth = 2.5 * widthSeg;
                let cHeight = 2.5 * heightSeg;

                // Mark the origin point such that the crop is centered on the image
                let x = xCenter - (cWidth / 2);
                let y = yCenter - (cHeight / 2);

                // Scale the canvas 
                let sWidth = 2 * cWidth;
                let sHeight = 2 * cHeight

                canvas1.width = sWidth;
                canvas1.height = sHeight;

                // Draw the new image, keeping its proportions intact for optimal matching
                context1.drawImage(image, x, y, cWidth, cHeight, 0, 0, sWidth, sHeight);

                image = canvas1.toDataURL('image/jpeg', 1.0);

                resolve(image);
            }
            // Trigger loading of the image
            image.src = imageUri;
        });
    }

    /** Captures photo over a 3-second duration */
    capturePhotoShots = () => {

        // Track on Google Analytics that a photo was captured
        analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.TAKE_PHOTO, eventLabel: GA_EVENT_LABEL.SNAP_BUTTON });

        // Update the snap attempts with this scan as a single attempt
        localStorage.setItem(SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        localStorage.setItem(SNAP_LAST_TIMESTAMP, Date.now());

        let prefLang = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || "en";

        // Capture a photo scan every third of a second
        this.scan = setInterval(() => {

            // Only capture if a match hasn't already been found
            if (this.matchFound == false) {

                // Get the the present image in the canvas and crop the image
                let canvas = this.getVideoCanvas();

                if (process.env.IMAGE_ENGINE === 'CUDA') {
                    let imageUri = canvas.toDataURL('image/jpeg', 1.0);
                    this.submitRequestCuda(imageUri);
                }

                else if (process.env.IMAGE_ENGINE === 'CATCHOOM') {
                    canvas.toBlob((imageBlob) => {
                        this.submitRequestCatchoom(imageBlob);
                    }, 'image/jpeg');
                }

                /* this.cropPhoto(imageUri)
                    .then((croppedImageUri) => {
                        this.submitRequest(croppedImageUri, imageCount);
                        imageCount++;
                    }); */
            }
        }, 1000 / 3);

        // End the interval after three seconds
        setTimeout(() => {
            clearInterval(this.scan);
        }, 3000);
    }

    /** Submit a photo scan to the server */
    submitRequestCuda = (imageUri) => {
        // Make request to server
        axios.post('/api/snaps/searchCuda', {
            image: imageUri
        })
            .then(response => {

                // Increment the responses we've received
                this.responseCounter++;

                // If a match was found     
                if (response.data.image_ids.length > 0 && !this.matchFound) {

                    // Update that the match request has been completed and get the image id
                    clearInterval(this.scan);
                    this.matchFound = true;
                    this.setState({ searchInProgress: true, showVideo: false });
                    let imageId = response.data.image_ids[0];

                    this.getArtworkInformation(imageId);
                }
                // Otherwise, no match was found by the time we've received all of our requests
                else { if (this.responseCounter == 9 && !this.matchFound) { this.processRequestComplete(false, null) } }
            })
            .catch(error => {
                console.log('An error occurred in Cuda', error);
                // analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_FAILURE, eventLabel: GA_EVENT_LABEL.SNAP_FAILURE });
                this.setState({ searchInProgress: false });
                this.props.history.push({ pathname: '/not-found' });
            });
    }

    /** Submit the image to Catchoom for image recognition */
    submitRequestCatchoom = (imageBlob) => {

        // Axios headers
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        let url = 'https://search.craftar.net/v1/search';
        let token = '2999d63fc1694ce4';

        // Append to form data
        let fd = new FormData();
        fd.append('token', token);
        fd.append('image', imageBlob);

        // Make request to server
        axios.post(url, fd, config)
            .then(response => {

                // If a match was found
                if (response.data.results.length > 0 && !this.matchFound) {

                    // Update that the match request has been completed and get the image id
                    clearInterval(this.scan);
                    this.matchFound = true;
                    this.setState({ searchInProgress: true, showVideo: false });

                    let imageId = response.data.results[0].item.name
                    this.getArtworkInformation(imageId);
                }
                // Otherwise, no match was found by the time we've received all of our requests
                else { if (this.responseCounter == 9 && !this.matchFound) { this.processRequestComplete(false, null) } }
            })
            .catch(error => {
                // analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_FAILURE, eventLabel: GA_EVENT_LABEL.SNAP_FAILURE });
                this.setState({ searchInProgress: false });
                this.props.history.push({ pathname: '/not-found' });
            });
    }

    submitRequest = (imageData) => {

        let url;
        let data;
        let config;

        if (process.env.IMAGE_ENGINE === 'CUDA') {

            url = '/api/snaps/searchCuda';
            data = { image: imageData };
            config = null;
        }

        else if (process.env.IMAGE_ENGINE === 'CATCHOOM') {

            // Axios headers
            config = { headers: { 'Content-Type': 'multipart/form-data' } };
            url = 'https://search.craftar.net/v1/search';
            let token = '2999d63fc1694ce4';

            // Append to form data
            let fd = new FormData();
            fd.append('token', token);
            fd.append('image', imageBlob);

            data = fd;
        }
        this.executeRequest(url, data, config)
    }

    executeRequest = (url, data, config) => {
        axios.post(url, data, config)
            .then(response => {

                // Increment the responses we've received
                this.responseCounter++;
                let imageId;

                if (process.env.IMAGE_ENGINE === 'CATCHOOM') {

                    // If a match was found
                    if (response.data.results.length > 0 && !this.matchFound) {

                        this.matchFound = true;
                        clearInterval(this.scan);
                        imageId = response.data.results[0].item.name
                        this.setState({ searchInProgress: true, showVideo: false });
                        this.getArtworkInformation(imageId);
                    }

                    else { if (this.responseCounter == 9 && !this.matchFound) { this.processRequestComplete(false, null) } }
                }
                else {
                    if (response.data.image_ids.length > 0 && !this.matchFound) {
                        this.matchFound = true;
                        clearInterval(this.scan);
                        imageId = response.data.image_ids[0];
                        this.setState({ searchInProgress: true, showVideo: false });
                        this.getArtworkInformation(imageId);
                    }
                    else { if (this.responseCounter == 9 && !this.matchFound) { this.processRequestComplete(false, null) } }
                }
            })
            .catch(error => {
                // analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_FAILURE, eventLabel: GA_EVENT_LABEL.SNAP_FAILURE });
                this.setState({ searchInProgress: false });
                this.props.history.push({ pathname: '/not-found' });
            });
    }

    /** Retrieves the information for the identified piece */
    getArtworkInformation = (imageId) => {

        if (!this.requestComplete) {
            // Make request to server
            axios.post('/api/snaps/getArtworkInformation', { imageId: imageId })
                .then(response => { this.requestComplete = true; this.processRequestComplete(true, response.data); })
                .catch(error => {
                    analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_FAILURE, eventLabel: GA_EVENT_LABEL.SNAP_FAILURE });
                    this.setState({ searchInProgress: false });
                    this.props.history.push({ pathname: '/not-found' });
                });
        }

    }

    /** Process the request complete response */
    processRequestComplete(responseFound, response) {

        // Turn off the search-in-progress animation
        if (this.state.searchInProgress) { this.setState({ searchInProgress: false }); }

        if (responseFound) {
            // Update analytics of the successful snap event
            analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_SUCCESS, eventLabel: GA_EVENT_LABEL.SNAP_SUCCESS });

            // Navigate to results page
            this.props.history.push({ pathname: '/results', state: { result: response, snapCount: localStorage.getItem(SNAP_ATTEMPTS) } });
        }
        else {
            // Update analytics of the failed snap event
            analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.SNAP_FAILURE, eventLabel: GA_EVENT_LABEL.SNAP_FAILURE });

            //  Navigate to not found page
            this.props.history.push({ pathname: '/not-found' });
        }
    }

    clearPhoto = (ev) => {
        this.toggleImage(false);
        this.setState((prevState, props) => {
            return {
                ...prevState,
                showVideo: true,
                searchedImageURL: '',
                searchResults: [],
                error: ''
            };
        });

        setTimeout(() => {
            this.zoomLevel = 1;
        }, 0);
    }

    /** Resets the zoom to its initial state when navigating back to the Camera page */
    resetZoom = () => {
        if (this.camera_capabilities && 'zoom' in this.camera_capabilities) {
            this.track.applyConstraints({ advanced: [{ zoom: 1 }] });
        }
    }

    updateZoom = () => {
        if ('zoom' in this.camera_capabilities && this.zoomLevel >= this.camera_capabilities.zoom.min && this.zoomLevel <= this.camera_capabilities.zoom.max) {
            this.track.applyConstraints({ advanced: [{ zoom: this.zoomLevel }] });
        } else {
            if (isIOS) {
                console.log('Setting scale to = ' + this.zoomLevel);
                this.video.style.webkitTransform = 'scale(' + this.zoomLevel + ')';
            } else {
                console.log('Either zoom is not supported by the device or you are zooming beyond supported range.');
            }
        }

        this.ticking = false;
    }

    requestZoom = () => {
        if (!this.ticking) {
            requestAnimationFrame(this.updateZoom);
            this.ticking = true;
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
                this.setState({ videoStream });
            })
            .catch(err => this.setState({ error: "An error occurred accessing the device camera" }));

        const el = document.querySelector('.camera');
        const mc = new Hammer.Manager(el, { preventDefault: true });
        mc.add(new Hammer.Pinch({ threshold: 0 }));
        mc.on("pinchstart pinchin pinchout", (e) => {
            if (e.type == 'pinchstart') {
                this.initZoom = this.zoomLevel || 1;
            }
            this.zoomLevel = (this.initZoom * e.scale).toFixed(1);
            this.zoomLevel = (this.zoomLevel < 1) ? 1 : this.zoomLevel;
            this.requestZoom();
        });

        // Beginning with iOS 10, the "user-scalable=no" attribute is no longer supported 
        const camera_controls = document.querySelector('.camera-controls');
        camera_controls.addEventListener('touchmove', function (event) {
            // The below disables the page zoom in that occurs on pinch in camera-control buttons section
            event.preventDefault();
        }, false);
    }

    componentDidUpdate() {

        this.requestComplete = false;
        this.responseCounter = 0;

        // When video is able to be captured
        if (this.state.showVideo && this.state.videoStream) {
            console.log('Component updated');

            this.video.srcObject = this.state.videoStream;

            this.video.play()
                .then(() => {

                    this.track = this.state.videoStream.getVideoTracks()[0];
                    this.camera_capabilities = this.track.getCapabilities();
                    this.camera_settings = this.track.getSettings();
                    requestAnimationFrame(this.resetZoom);
                    this.capturePhotoShots();
                })
                .catch((error) => {
                    console.log('Not allowed to access camera. Please check settings!');
                });

            this.img.style.display = 'none';

            // Reset snap attemps count if last_snap_timestamp is 12 hours or before.
            this.resetSnapCounter();
        }

        this.requestComplete = false; this.requestCompleteFlag = false;
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

    render() {
        return (
            <div className="camera-container">
                <div className="camera">
                    {
                        this.state.showVideo &&
                        <div>
                            <video id="video" ref={c => this.video = c} width="100%" autoPlay playsInline />
                            <div className="video-frame">
                                {/* Hint text */}
                                <p className="hint-text">Hint: Zooming into the details will help our app recognize your photo.</p>
                            </div>
                        </div>
                    }
                    <img ref={img => this.img = img} />
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
                {<CameraControls searchInProgress={this.state.searchInProgress} showVideo={this.state.showVideo} cancelCamera={this.cancelCamera} capturePhotoShots={this.capturePhotoShots} clearPhoto={this.clearPhoto} submitPhoto={this.submitPhoto} />}
            </div>
        );
    }
}

export default withRouter(Camera);