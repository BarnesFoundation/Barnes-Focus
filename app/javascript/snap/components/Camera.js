import React, { Component } from 'react';
import CameraDisplay from './CameraDisplay';
import CameraControls from './CameraControls';
import CameraSnap from './CameraSnap';
import axios from 'axios';

class Camera extends Component {

    state = {
        videoStream: null,
        frontCamera: false,
        currentImage: null,
        showVideo: true
    };

    // switchCamera() {
    //     this.setState({ frontCamera: !this.state.frontCamera });
    //     console.log('front camera = ' + this.state.frontCamera);
    // }

    takePhoto = () => {
        const image = this.capturePhoto();
        this.setState({ currentImage: image, showVideo: false })
    }

    capturePhoto = () => {
        console.log('capture photo clicked!');
        const context = this.canvas.getContext("2d")
        context.drawImage(this.camera.videoEl, 0, 0, 800, 600)
        const image = this.canvas.toDataURL('image/jpeg', 1.0)
        return image
    }

    clearPhoto = () => {
        this.setState({ currentImage: null, showVideo: true });
    }

    submitPhoto = () => {
        console.log('submitting photo to backend');

        axios.post('/api/snaps/search', {
          image_data: this.state.currentImage
        }).then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentDidMount() {

        navigator.mediaDevices.getUserMedia({
            video: {
                "facingMode": (this.state.frontCamera) ? "user" : "environment",
                // "mandatory": {
                //     "maxWidth": 1920,
                //     "maxHeight": 1080
                // },
                // "optional": [
                //     {
                //         "minWidth": 1920
                //     },
                //     {
                //         "minHeight": 1080
                //     }
                // ]
            }
        })
            .then(videoStream => this.setState({ videoStream }))
            .catch(err => this.setState({ error: "Error accessing device camera." }));


    }

    render() {
        return (
            <div className="camera">
                {this.state.showVideo && <CameraDisplay stream={this.state.videoStream} ref={(camera) => { this.camera = camera }} />}
                {!this.state.showVideo && <CameraSnap currentImage={this.state.currentImage} />}
                <CameraControls showVideo={this.state.showVideo} takePhoto={this.takePhoto} clearPhoto={this.clearPhoto} submitPhoto={this.submitPhoto} />
                <canvas
                    ref={(canvas) => { this.canvas = canvas }}
                    width='800'
                    height='600'
                    style={{ display: 'none' }}>
                </canvas>
            </div>
        );
    }
}

export default Camera;