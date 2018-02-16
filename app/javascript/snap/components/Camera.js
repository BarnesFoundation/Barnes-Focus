import React, { Component } from 'react';
import CameraDisplay from './CameraDisplay';
import CameraControls from './CameraControls';
import CameraSnap from './CameraSnap';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

class Camera extends Component {

    state = {
        videoStream: null,
        frontCamera: false,
        currentImage: null,
        showVideo: true,
        searchedImageURL: '',
        loading: false,
        searchResults: [],
        error: ''
    };

    // switchCamera() {
    //     this.setState({ frontCamera: !this.state.frontCamera });
    //     console.log('front camera = ' + this.state.frontCamera);
    // }

    takePhoto = () => {
        const image = this.capturePhoto();
        this.setState({ currentImage: image, showVideo: false });
    }

    capturePhoto = () => {
        console.log('capture photo clicked!');
        var canvas = this.getCanvas();
        const context = canvas.getContext("2d");
        console.log('canvas.width, canvas.height', canvas.width, canvas.height);
        context.drawImage(this.camera.videoEl, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL('image/jpeg', 1.0);
        return image;
    }

    clearPhoto = () => {
        this.setState((prevState, props) => {
            return {
                ...prevState,
                currentImage: null,
                showVideo: true,
                searchedImageURL: '',
                searchResults: [],
                error: ''
            };
        });
        //this.setState({ currentImage: null, showVideo: true, searchedImageURL: '', searchResults: [], error: '' });
    }

    submitPhoto = () => {
        console.log('submitting photo to backend');
        this.setState({ loading: true });
        axios.post('/api/snaps/search', {
            image_data: this.state.currentImage
        }).then(function (response) {
            const search_resp = response["data"];
            if (search_resp["success"] && search_resp["data"]["records"].length > 0) {
                const art_obj = search_resp["data"]["records"][0];
                const art_url = "https://barnes-image-repository.s3.amazonaws.com/images/" + art_obj['id'] + "_" + art_obj['imageSecret'] + "_n.jpg";
                const result = {};
                result['title'] = art_obj.title;
                result['artist'] = art_obj.people;
                result['classification'] = art_obj.classification;
                result['locations'] = art_obj.locations;
                result['medium'] = art_obj.medium;
                result['url'] = art_obj.art_url;
                this.setState({ searchedImageURL: art_url, searchResults: this.state.searchResults.concat(result) });

            } else {
                this.setState({ error: "No records found!" });
            }
            this.setState({ loading: false });
        }.bind(this))
            .catch(function (error) {
                console.log(error);
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
            .then(videoStream => this.setState({ videoStream }))
            .catch(err => this.setState({ error: "Error accessing device camera." }));


    }

    getCanvas = () => {
        const video = this.camera.videoEl;

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
            <div className="camera">
                {this.state.showVideo && <CameraDisplay stream={this.state.videoStream} ref={(camera) => { this.camera = camera }} />}
                {!this.state.showVideo && <CameraSnap currentImage={this.state.currentImage} />}
                <CameraControls showVideo={this.state.showVideo} takePhoto={this.takePhoto} clearPhoto={this.clearPhoto} submitPhoto={this.submitPhoto} />

                <div className="snap-spinner">
                    <ClipLoader
                        color={'#BD10E0'}
                        loading={this.state.loading}
                    />
                </div>
                <div className="row">
                    {this.state.searchResults.length > 0 &&
                        <a className="image-url col-sm-12" href={this.state.searchedImageURL} target="_blank">
                            <img src={this.state.searchedImageURL} alt="result" className="img-thumbnail" />
                        </a>
                    }
                    {this.state.error &&
                        <div className="col-sm-12">
                            <p>No results found!</p>
                        </div>
                    }
                </div>
                {this.state.searchResults.length > 0 &&
                    <div className="row">
                        <div className="results col-sm-12">
                            <p><strong>Title:&nbsp;</strong> {this.state.searchResults[0].title}</p>
                            <p><strong>Artist:&nbsp;</strong> {this.state.searchResults[0].artist}</p>
                            <p><strong>Classification:&nbsp;</strong> {this.state.searchResults[0].classification}</p>
                            <p><strong>Medium:&nbsp;</strong> {this.state.searchResults[0].medium}</p>
                            <p><strong>Location:&nbsp;</strong> {this.state.searchResults[0].locations}</p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Camera;