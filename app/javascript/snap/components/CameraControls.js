import React from 'react';

const CameraControls = (props) => (
    <div className="camera-controls">
        <div className="controls">
            <a id="clear-photo" title="Clear Photo" className={(props.showVideo) ? 'disabled' : ''} onClick={props.clearPhoto}><i className="material-icons">delete</i></a>
            <a id="take-photo" title="Take Photo" className={(props.showVideo) ? '' : 'disabled'} onClick={props.takePhoto} ><i className="material-icons" >camera_alt</i></a>
            <a  id="submit-photo" title="Submit Photo" className={(props.showVideo) ? 'disabled' : ''} onClick={props.submitPhoto}><i className="material-icons">info</i></a>
            {/* <a href="#" onClick={props.switchCamera} id="switch-cam" title="Switch Camera" className="material-icons"><i className="material-icons">cached</i></a> */}
        </div>
    </div>
);

export default CameraControls;