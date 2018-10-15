import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SNAP_LANGUAGE_TRANSLATION } from './Constants';

class CameraControls extends Component {

    constructor(props) {
        super(props);
        let translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);
        this.state = {
            translation: (translationObj) ? JSON.parse(translationObj) : null
        } 
    }

    componentDidMount() {
        setTimeout(() => {
            this.props.capturePhotoShots();
        }, 200);
    }

    render() {
        return (
            <div>
                {
                    !this.props.searchInProgress &&
                    <div className="camera-controls" >
                        <div className="controls">
                            {/**
                                this.props.showVideo &&
                                <div>
                                    <div id="snap-cancel" className="control-left" onClick={this.props.cancelCamera}>
                                        {(this.state.translation) ? this.state.translation.Camera.text_2.translated_content : `Cancel`}
                                    </div>
                                     
                                    {
                                        <div id="snap-click" className="camera-shutter">
                                            <span>{(this.state.translation) ? this.state.translation.Camera.text_1.translated_content : `PHOTO`}</span>
                                            <div className="round-button-circle" onClick={this.props.takePhoto}></div>
                                        </div>
                                    }
                                </div>
                            */}

                            { /**
                                !this.props.showVideo &&
                                <div>
                                    <div id="snap-retake" className="control-left" onClick={this.props.clearPhoto}>
                                        {(this.state.translation) ? this.state.translation.Camera.text_3.translated_content : `Retake`}
                                    </div>
                                    <div id="snap-submit" className="control-right" onClick={this.props.submitPhoto}>
                                        {(this.state.translation) ? this.state.translation.Camera.text_4.translated_content : `Use Photo`}
                                    </div>
                                </div>
                                */ }
                        </div>
                    </div >
                }
            </div>
        )
    }

}

export default CameraControls;