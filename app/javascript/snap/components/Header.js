import React, { Component } from 'react';
import { withRouter } from 'react-router'
import barnes_logo from 'images/logo.svg';

/** 
 * withHeader HOC provides props with location, history and match objects
*/
class Header extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {
                    this.props.location.pathname !== '/snap' &&
                    this.props.location.pathname !== '/results' &&
                    <nav className="narbar header">
                        <a className="navbar-brand">
                            <img src={barnes_logo} alt="Barnes" />
                        </a>
                    </nav>
                }
            </div>
        );
    }
}

export default withRouter(Header);