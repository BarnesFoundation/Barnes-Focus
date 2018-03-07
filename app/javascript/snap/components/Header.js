import React from 'react';
import barnes_logo from 'images/logo.svg';

const Header = () => (
    <div className="header">
        <a className="navbar-brand" href="#" ui-sref="home.market">
            <img src={barnes_logo} alt="Barnes" />
        </a>
    </div>
)

export default Header;