import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { compose } from 'redux';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

import home_background from 'images/barnes-v2-landing.png';
import kf_logo from 'images/knight-foundation-logo.svg';
import close_icon from 'images/cross.svg';
import * as constants from './Constants';

class AboutComponent extends Component {

    constructor(props) {
        super(props);
    }

    navigateBack = () => {
        this.props.history.goBack();
    }

    render() {
        return (
            <div className="about-wrapper">
                <img src={home_background} alt="home_background" style={{ width: screen.width, height: screen.height }} />
                <div>
                    <div className="kf-logo">
                        <img src={kf_logo} />
                    </div>
                    <div className="about-text h2">
                        <div className="kf-credit-line">
                            {constants.KNIGHT_FOUNDATION_CREDIT_TEXT}
                        </div>
                        <div className="app-version">
                            Version {constants.APP_VERSION}
                        </div>
                        <div className="terms-and-conditions">
                            <a href="https://www.barnesfoundation.org/terms" target="_blank">Terms & Conditions</a>
                        </div>
                    </div>
                    <div className="btn-close" onClick={this.navigateBack}>
                        <img src={close_icon} alt="close" />
                    </div>
                </div>
            </div>
        );

    }

}

export default compose(
    withOrientation,
    withTranslation,
    withRouter
)(AboutComponent);