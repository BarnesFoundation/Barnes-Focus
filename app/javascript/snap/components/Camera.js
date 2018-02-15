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
        searchResults: []
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
        this.setState({ currentImage: null, showVideo: true, searchedImageURL: '', searchResults: [] });
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
                this.setState({ searchedImageURL: "No records found!" });
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
                "facingMode": (this.state.frontCamera) ? "user" : "environment"
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
                <div className="snap-spinner">
                    <ClipLoader
                        color={'#BD10E0'}
                        loading={this.state.loading}
                    />
                </div>

                <a className="image-url" href={this.state.searchedImageURL} target="_blank">
                    {this.state.searchedImageURL && <img src={this.state.searchedImageURL} alt="result" className="img-thumbnail" />}
                </a>
                {this.state.searchedImageURL &&
                    <div className="results">
                        <small><strong>Title:&nbsp;</strong> this.state.searchResults[0].title</small>
                        <small><strong>Artist:&nbsp;</strong> this.state.searchResults[0].artist</small>
                        <small><strong>Classification:&nbsp;</strong> this.state.searchResults[0].classification</small>
                        <small><strong>Medium:&nbsp;</strong> this.state.searchResults[0].medium</small>
                        <small><strong>Location:&nbsp;</strong> this.state.searchResults[0].locations</small>
                    </div>
                }
            </div>
        );
    }
}

export default Camera;