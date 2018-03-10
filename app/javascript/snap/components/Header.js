import React from 'react';
import barnes_logo from 'images/logo.svg';

const Header = () => (
    <nav className="narbar header">
        <a className="navbar-brand" href="#" ui-sref="home.market">
            <img src={barnes_logo} alt="Barnes" />
        </a>
    </nav>
)

export default Header;