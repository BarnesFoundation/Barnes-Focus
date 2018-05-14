import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Hammer from 'hammerjs';
import CameraControls from './CameraControls';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import barnes_logo from 'images/logo.svg';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_ATTEMPTS } from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';


class Camera extends Component {

    state = {
        videoStream: null,
        frontCamera: false,
        capturedImage: null,
        showVideo: true,
        searchInProgress: false,
        snapAttempts: localStorage.getItem(SNAP_ATTEMPTS) || 0
    };

    ticking = false;
    track; camera_capabilities; camera_settings; initZoom; zoomLevel;


    cancelCamera = () => {
        this.props.history.push({
            pathname: '/',
            state: {
                cameraCancelled: true
            }
        });
    }

    toggleImage = (show) => {
        if (show) {
            this.img.style.visibility = 'visible';
            this.img.style.display = 'block';
        } else {
            this.img.src = '';
            this.img.style.visibility = 'hidden';
            this.img.style.display = 'none';
        }
    }

    takePhoto = () => {
        setTimeout(() => {
            const image = this.capturePhoto();
            this.img.src = image;
            this.setState({ capturedImage: image, showVideo: false });
            this.toggleImage(true);
        }, 200);
    }

    capturePhoto = () => {
        console.log('capture photo clicked!');
        let canvas = this.getCanvas();
        const context = canvas.getContext("2d");

        if (isIOS || !this.camera_capabilities) {
            let rect = this.video.getBoundingClientRect();
            let tempCanvas = document.createElement('canvas');
            let tempCtx = tempCanvas.getContext('2d');

            //first draw the scaled video in a temp canvas.
            tempCanvas.width = rect.width;
            tempCanvas.height = rect.height;
            tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);

            // Now copy image that is visible within the viewport into our original canvas.

            let x = (rect.x < 0) ? -(rect.x) : rect.x;
            let y = (rect.y < 0) ? -(rect.y) : rect.y;
            console.log('Drawing viewport area x:y ' + x + ' : ' + y + ' and width:heignt ' + canvas.width + ' : ' + canvas.height);
            if (x > 0 && y > 0) {
                context.drawImage(tempCanvas, Math.floor(x), Math.floor(y), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            } else {
                context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            }
        } else {
            context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        }
        const image = canvas.toDataURL('image/jpeg', 1.0);
        return image;
    }

    clearPhoto = (ev) => {
        console.log('Clear taken photo');
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

    submitPhoto = () => {
        this.toggleImage(false);
        this.setState({ searchInProgress: true });
        localStorage.setItem(SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        var prefLang = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || "en";
        axios.post('/api/snaps/search', {
            image_data: this.state.capturedImage,
            language: prefLang
        }).then(response => {
            this.setState({ searchInProgress: false });
            // Navigate to search result page or not found page
            const res = response.data;
            if (res.data.records.length === 0) {
                this.props.history.push({ pathname: '/not-found' });
            } else {
                this.props.history.push({
                    pathname: '/results',
                    state: {
                        result: res,
                        snapCount: localStorage.getItem(SNAP_ATTEMPTS)
                    }
                });
            }

        })
            .catch(error => {
                this.setState({ searchInProgress: false });
                this.props.history.push({ pathname: '/not-found' });
            });
    }

    updateZoom = () => {
        if ('zoom' in this.camera_capabilities && this.zoomLevel >= this.camera_capabilities.zoom.min && this.zoomLevel <= this.camera_capabilities.zoom.max) {
            this.track.applyConstraints({ advanced: [{ zoom: this.zoomLevel }] });
        } else {
            if (isIOS) {
                console.log('Setting scale to = ' + Math.floor(this.zoomLevel));
                this.video.style.webkitTransform = 'scale(' + Math.floor(this.zoomLevel) + ')';
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
            .catch(err => this.setState({ error: "Error accessing device camera." }));

        const el = document.querySelector('.camera');
        const mc = new Hammer.Manager(el, { preventDefault: true });
        mc.add(new Hammer.Pinch({ threshold: 0 }));
        mc.on("pinchstart pinchin pinchout", (e) => {

            //alert('received pinch event');
            if (e.type == 'pinchstart') {
                this.initZoom = this.zoomLevel || 1;
            }
            //console.log('e.scale ' + e.scale);
            this.zoomLevel = (this.initZoom * e.scale).toFixed(1);
            this.zoomLevel = (this.zoomLevel < 1) ? 1 : this.zoomLevel;

            this.requestZoom();


        });

    }

    componentDidUpdate() {

        if (this.state.showVideo) {
            console.log('componentDidUpdate : Camera');
            this.video.srcObject = this.state.videoStream;
            this.video.play().then(() => {
                console.log('Camera is up and running!');
                this.track = this.state.videoStream.getVideoTracks()[0];
                this.camera_capabilities = this.track.getCapabilities();
                this.camera_settings = this.track.getSettings();
            }).catch((error) => {
                console.log('Not allowed to access camera. Please check settings!');
            });

            this.img.style.display = 'none';
        }

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
                            <div className="video-frame"></div>
                        </div>
                    }
                    <img ref={img => this.img = img} />

                    {/* ========= Search in progress screen ============ */}
                    {
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
                                    <h1>Searching</h1>
                                    <p>Please wait while we search our database.</p>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <CameraControls searchInProgress={this.state.searchInProgress} showVideo={this.state.showVideo} cancelCamera={this.cancelCamera} takePhoto={this.takePhoto} clearPhoto={this.clearPhoto} submitPhoto={this.submitPhoto} />
            </div>
        );
    }
}

export default withRouter(Camera);