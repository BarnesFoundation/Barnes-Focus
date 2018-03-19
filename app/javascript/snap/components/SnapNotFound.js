import React from 'react';
import { Link } from 'react-router-dom';

const SnapNotFound = (props) => (
    <div className="search-error-container">
        <div className="error-container">
            <h1>Try again! We couldn't match that work of art.</h1>
            <p>Tip: Our snap app is most successful at recognizing two-dimensional works of art like paintings.</p>
        </div >
        <div className="row">
            <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                <Link className="btn snap-btn snap-btn-default" to="/snap">
                    Take photo
                </Link>
            </div>
        </div>

    </div>
);

export default SnapNotFound;