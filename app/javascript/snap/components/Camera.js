import React, { Component } from 'react';
import Hammer from 'hammerjs';
import CameraDisplay from './CameraDisplay';
import CameraControls from './CameraControls';
import CameraSnap from './CameraSnap';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import debounce from 'throttle-debounce/debounce';


class Camera extends Component {

    state = {
        videoStream: null,
        frontCamera: false,
        capturedImage: null,
        showVideo: true,
        searchedImageURL: '',
        loading: false,
        searchResults: [],
        pastecResults: [],
        error: ''
    };



    // switchCamera() {
    //     this.setState({ frontCamera: !this.state.frontCamera });
    //     console.log('front camera = ' + this.state.frontCamera);
    // }

    takePhoto = () => {
        const image = this.capturePhoto();
        this.img.src = image;
        this.setState({ capturedImage: image, showVideo: false });
        this.img.style.visibility = 'visible';
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
        ev.preventDefault();
        this.img.src = '';
        this.img.style.visibility = 'hidden';
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
        console.log('submitting photo to backend');
        this.setState({ loading: true });
        axios.post('/api/snaps/search', {
            image_data: this.state.capturedImage
        }).then(function (response) {
            const search_resp = response["data"];
            const result = {};
            if (search_resp["success"]) {
                if (search_resp["data"]["records"].length > 0) {
                    const art_obj = search_resp["data"]["records"][0];
                    const art_url = "https://barnes-image-repository.s3.amazonaws.com/images/" + art_obj['id'] + "_" + art_obj['imageSecret'] + "_n.jpg";
                    result['title'] = art_obj.title;
                    result['artist'] = art_obj.people;
                    result['classification'] = art_obj.classification;
                    result['locations'] = art_obj.locations;
                    result['medium'] = art_obj.medium;
                    result['url'] = art_obj.art_url;
                    result['invno'] = art_obj.invno;
                    this.setState({
                        searchedImageURL: art_url,
                        searchResults: this.state.searchResults.concat(result)
                    });
                }
                this.setState({
                    pastecResults: search_resp['pastec_data']
                });

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
            .then(videoStream => {
                this.setState({ videoStream });
            })
            .catch(err => this.setState({ error: "Error accessing device camera." }));

        const el = document.querySelector('.camera');
        const mc = new Hammer.Manager(el, { preventDefault: true });
        mc.add(new Hammer.Pinch({ threshold: 0 }));
        mc.on("pinchin pinchout", (e) => {
            debounce(100, function () {
                // Throttled function 
                const track = this.state.videoStream.getVideoTracks()[0];
                const camera_capabilities = track.getCapabilities();
                const camera_settings = track.getSettings();

                console.log('pinch event :: ' + e.type + ' scale :: ' + e.scale);
                const current_zoom = camera_settings.zoom;
                let zoomLevel = (e.type === 'pinchout') ? Math.floor(current_zoom + e.scale) : Math.floor(current_zoom - e.scale);
                zoomLevel = (zoomLevel <= 0) ? 1 : zoomLevel;
                console.log('zoomLevel set to :: ' + zoomLevel);
                // if device supports zoom
                if ('zoom' in camera_capabilities && zoomLevel >= camera_capabilities.zoom.min && zoomLevel <= camera_capabilities.zoom.max) {
                    track.applyConstraints({ advanced: [{ zoom: zoomLevel }] });
                } else {
                    console.log('Either zoom is not supported by the device or you are zooming beyond supported range.');
                }
            });


        });
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
            <div className="camera">
                {
                    this.state.showVideo &&
                    <div>
                        <video id="video" ref={c => this.video = c} width="100%" height="100%" autoPlay playsInline />
                        <div className="video-frame">
                        </div>
                    </div>
                }
                <img ref={img => this.img = img} width="100%" height="100%" />
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
                            <p><strong>Accession No.:&nbsp;</strong> {this.state.searchResults[0].invno}</p>
                            <p><strong>Classification:&nbsp;</strong> {this.state.searchResults[0].classification}</p>
                            <p><strong>Medium:&nbsp;</strong> {this.state.searchResults[0].medium}</p>
                            <p><strong>Location:&nbsp;</strong> {this.state.searchResults[0].locations}</p>
                        </div>
                    </div>
                }
                <div className="row">
                    {this.state.pastecResults.length > 0 &&
                        <div className="pastec-data">
                            <p><strong>PASTEC DATA</strong></p>
                            {this.state.pastecResults.map(function (img, index) {
                                return <div key={'mykey' + index}><p><strong>Image Idetifier:&nbsp;</strong> {img['image_id']}</p>
                                    <a className="image-url col-sm-12" href={img['image_url']} target="_blank">
                                        <img src={img['image_url']} alt="result" className="img-thumbnail" />
                                    </a>
                                </div>;
                            })}
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Camera;