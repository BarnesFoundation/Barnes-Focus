import React from 'react';
import { Link } from 'react-router-dom';

const SnapErrors = (props) => (

    <div className="search-error-container" >
        <h1>Try again! We couldn't match that work of art.</h1>

        <p>Tip: Our snap app is most successful at recognizing two-dimensional works of art like paintings.</p>

        <Link className="btn take-photo-btn" to="/snap">
            Take Photo
            <span className="icon">
                <img src={icon_camera} alt="camera_icon" />
            </span>
        </Link>

    </div >
);

export default SnapErrors;