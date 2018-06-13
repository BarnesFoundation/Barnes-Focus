import React from 'react';
import { Link } from 'react-router-dom';

const CameraControls = (props) => (

    <div>
        {
            !props.searchInProgress &&
            <div className="camera-controls" >
                <div className="controls">
                    {
                        props.showVideo &&
                        <div>
                            <div id="snap-cancel" className="control-left" onClick={props.cancelCamera}>Cancel</div>
                            <div id="snap-click" className="camera-shutter">
                                <span>PHOTO</span>
                                <div className="round-button-circle" onClick={props.takePhoto}></div>
                            </div>
                        </div>
                    }

                    {
                        !props.showVideo &&
                        <div>
                            <div id="snap-retake" className="control-left" onClick={props.clearPhoto}>Retake</div>
                            <div id="snap-submit" className="control-right" onClick={props.submitPhoto}>Use Photo</div>
                        </div>
                    }
                </div>
            </div >
        }
    </div>
);

export default CameraControls;