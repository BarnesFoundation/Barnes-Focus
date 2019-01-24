import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

import home_background from 'images/barnes-v2-landing.png';
import barnes_logo from 'images/Barnes_logo.svg';
import kf_logo from 'images/knight-foundation-logo.svg';
import close_icon from 'images/cross.svg';

import * as constants from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome, osVersion } from 'react-device-detect';



class HomeComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            snapAttempts: localStorage.getItem(constants.SNAP_ATTEMPTS) || 0,
            selectedLanguage: '',
            userAtBarnes: true
        }
    }

    /**
     * Check if last_snap_timestamp is more than 24 hrs. If true, reset all user preferences.
     * 
     * @memberof HomeComponent
     */
    resetSnapApp = () => {
        console.log('Try to reset app when home page loads.');

        // Get last snap timestamp from local storage
        let lastSnapTimestamp = parseInt(localStorage.getItem(constants.SNAP_LAST_TIMESTAMP));


        if (lastSnapTimestamp) {

            // Check if the last snap timestamp was more than the interval time ago
            let ttl = (lastSnapTimestamp + parseInt(constants.SNAP_APP_RESET_INTERVAL)) - Date.now();

            // Reset the application if so
            if (ttl <= 0) {
                localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

                localStorage.removeItem(constants.SNAP_LANGUAGE_PREFERENCE);
                localStorage.removeItem(constants.SNAP_USER_EMAIL);
                localStorage.removeItem(constants.SNAP_ATTEMPTS);
            }
        }
    }

    /* checkForGetUserMedia = () => {
        console.log('iOS was detected');
        ReactModal.setAppElement('#app');

        // navigator.mediaDevices.getUserMedia() is only supported on iOS > 11.0 and only on Safari (not Chrome, Firefox, etc.)
        if (isIOS && (osVersion <= 11.0)) {
            if (!isSafari) {
                
            }
        }

        // If they're not on iOS 11, it doesn't matter what browser they're using, navigator.mediaDevices.getUserMedia() will return undefined
        else {
            
        } 
    } */

    componentWillMount() {
        // Reset barnesfoc.us application if last_snap_timestamp is more than 24 hrs
        this.resetSnapApp();
    }

    componentDidMount() {
        if ('orientation' in screen) {
            screen.orientation.addEventListener('change', (e) => {
                console.log('current orientation :: ' + screen.orientation.type);
                if (screen.orientation.type !== 'portrait-primary') {
                    console.log('The app is best viewed on Portrait mode');
                } else {

                }
            });
        } else {
            console.log('Orientation API not supported');
        }
    }

    onSelectYes = async () => {
        try {
            // Attempt to access device camera
            await navigator.mediaDevices.getUserMedia({ video: { "facingMode": "environment", "width": 1920, "height": 1080 } });

            // Navigate to the scan page
            this.props.history.push({ pathname: '/scan' });
        }

        catch (error) {
            this.setState({ error: "An error occurred accessing the device camera" })
        }
    }

    onSelectNo = () => {
        this.setState({ userAtBarnes: false });
    }

    navigateBackToHome = () => {
        this.setState({ userAtBarnes: true });
    }

    render() {
        return (
            <div className="home-wrapper" id="home-wrapper">
                <img src={home_background} alt="home_background" style={{ width: screen.width, height: screen.height }} />
                {this.state.userAtBarnes && <div className="landing-screen">
                    <img src={barnes_logo} alt="barnes_logo" className="logo-center" />
                    {/* <div className="user-loc-prompt">Are you at <br />the Barnes?</div> */}
                    <div className="user-loc-prompt">{this.props.getTranslation('Welcome_screen', 'text_1')}</div>
                    <div className="home-action">
                        <button className="action-btn" onClick={this.onSelectYes}>
                            <span className="action-text h2">{this.props.getTranslation('Welcome_screen', 'text_2')}</span>
                        </button>
                        <button className="action-btn" onClick={this.onSelectNo}>
                            <span className="action-text h2">{this.props.getTranslation('Welcome_screen', 'text_3')}</span>
                        </button>
                    </div>
                    <div className="kf-banner">
                        <img src={kf_logo} alt="knight_foundation_logo" className="kf-logo" />
                        <div className="kf-text caption">{constants.KNIGHT_FOUNDATION_CREDIT_TEXT}</div>
                    </div>
                </div>
                }
                {!this.state.userAtBarnes &&
                    <div>
                        <div className="app-usage-alert h2">
                            <div className="app-usage-msg">
                                <span>{this.props.getTranslation('Visit_soon', 'text_1')}</span>
                                <span> {this.props.getTranslation('Visit_soon', 'text_2')}</span>
                            </div>
                            <div className="visit-online-link">
                                <a href="https://www.barnesfoundation.org/" target="_blank">{this.props.getTranslation('Visit_soon', 'text_3')}</a>
                            </div>
                        </div>
                        <div className="btn-close" onClick={this.navigateBackToHome}>
                            <img src={close_icon} alt="close" />
                        </div>
                    </div>
                }

            </div >
        );
    }
}

export default compose(
    withOrientation,
    withTranslation,
    withRouter
)(HomeComponent);

