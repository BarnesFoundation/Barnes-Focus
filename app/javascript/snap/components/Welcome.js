import React from 'react';

import { Link } from 'react-router-dom';

const WelcomeComponent = () => (
    <div className="container-fluid">
        <div className="content">
            <h1>It's a snap!</h1>

            <p>Take a photo of any work of art to get information about it.</p>
            <Link className="btn btn-primary" to="/snap">Continue</Link>
        </div>
    </div>

);

export default WelcomeComponent;

