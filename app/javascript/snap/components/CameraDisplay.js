import React, { Component } from 'react';

class CameraDisplay extends Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        console.log('componentDidUpdate : CameraDisplay');
        this.videoEl.srcObject = this.props.stream;
        this.videoEl.play().then(() => {
            console.log('Camera is up and running!');
        }).catch((error) => {
            console.log('Not allowed to access camera. Please check settings!');
        });
    }

    componentWillUnmount() {
        console.log('componentWillUnmount : CameraDisplay');
    }

    render() {
        return (
            <video id="video" ref={c => this.videoEl = c} width="100%" height="100%" autoPlay playsInline />
        );
    }
}

export default CameraDisplay;