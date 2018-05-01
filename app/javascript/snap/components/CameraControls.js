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
                            <a className="control-left" onClick={props.cancelCamera}>Cancel</a>
                            <div className="camera-shutter">
                                <span>PHOTO</span>
                                <a className="round-button-circle" onClick={props.takePhoto}></a>
                            </div>
                        </div>
                    }

                    {
                        !props.showVideo &&
                        <div>
                            <a className="control-left" onClick={props.clearPhoto}>Retake</a>
                            <a className="control-right" onClick={props.submitPhoto}>Use Photo</a>
                        </div>
                    }
                </div>
            </div >
        }
    </div>
);

export default CameraControls;