import React, { Component } from 'react';

class CameraDisplay extends Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        console.log('componentDidUpdate : CameraDisplay');
        this.videoEl.srcObject = this.props.stream;
        this.videoEl.play();
    }

    componentWillUnmount() {
        // if (this.videoEl && this.videoEl.srcObject) {
        //     this.videoEl.srcObject.getTracks().forEach(t => t.stop());
        // }
        //this.videoEl.pause();
        console.log('componentWillUnmount : CameraDisplay');
    }

    render() {
        return (
            <video id="video" ref={c => this.videoEl = c} width="100%" height="100%" />
        );
    }
}

export default CameraDisplay;