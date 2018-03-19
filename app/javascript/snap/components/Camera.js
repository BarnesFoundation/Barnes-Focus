import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Hammer from 'hammerjs';
import CameraControls from './CameraControls';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import barnes_logo from 'images/logo.svg';
import { SNAP_LANGUAGE_PREFERENCE } from './Constants';

class Camera extends Component {

    state = {
        videoStream: null,
        frontCamera: false,
        capturedImage: null,
        showVideo: true,
        searchInProgress: false
    };



    // switchCamera() {
    //     this.setState({ frontCamera: !this.state.frontCamera });
    //     console.log('front camera = ' + this.state.frontCamera);
    // }

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
        const image = this.capturePhoto();
        this.img.src = image;
        this.setState({ capturedImage: image, showVideo: false });
        this.toggleImage(true);
    }

    capturePhoto = () => {
        console.log('capture photo clicked!');
        var canvas = this.getCanvas();
        const context = canvas.getContext("2d");
        console.log('canvas.width, canvas.height', canvas.width, canvas.height);
        context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL('image/jpeg', 1.0);
        return image;
    }

    clearPhoto = (ev) => {
        //ev.preventDefault();
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
    }

    submitPhoto = () => {
        this.toggleImage(false);
        this.setState({ searchInProgress: true });
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
                        result: res
                    }
                });
            }

        })
            .catch(error => {
                this.setState({ searchInProgress: false });
                this.props.history.push({ pathname: '/not-found' });
            });
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

        const el = document.querySelector('.camera-container');
        const mc = new Hammer.Manager(el, { drag_lock_to_axis: true, preventDefault: true });
        mc.add(new Hammer.Pinch({ threshold: 0 }));
        mc.on("pinchin pinchout", (e) => {

            const track = this.state.videoStream.getVideoTracks()[0];
            const camera_capabilities = track.getCapabilities();
            const camera_settings = track.getSettings();

            const current_zoom = camera_settings.zoom;
            let zoomLevel = (e.type === 'pinchout') ? Math.floor(current_zoom + e.scale) : Math.floor(current_zoom - e.scale);
            zoomLevel = (zoomLevel <= 0) ? 1 : zoomLevel;

            // if device supports zoom
            if ('zoom' in camera_capabilities && zoomLevel >= camera_capabilities.zoom.min && zoomLevel <= camera_capabilities.zoom.max) {
                track.applyConstraints({ advanced: [{ zoom: zoomLevel }] });
            } else {
                console.log('Either zoom is not supported by the device or you are zooming beyond supported range.');
            }
        });

        // mc.on("swipe drag", function (event) {
        //     if (event.gesture.direction == Hammer.DIRECTION_UP || event.gesture.direction == Hammer.DIRECTION_DOWN) {
        //         event.gesture.preventDefault();
        //     }
        // });
    }

    componentDidUpdate() {
        if (this.state.showVideo) {
            console.log('componentDidUpdate : Camera');
            this.video.srcObject = this.state.videoStream;
            this.video.play().then(() => {
                console.log('Camera is up and running!');
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
            canvas.height = video.clientWidth;

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
                    <img ref={img => this.img = img} width="100%" height="100%" />

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
                <CameraControls searchInProgress={this.state.searchInProgress} showVideo={this.state.showVideo} takePhoto={this.takePhoto} clearPhoto={this.clearPhoto} submitPhoto={this.submitPhoto} />
            </div>
        );
    }
}

export default withRouter(Camera);