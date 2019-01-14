import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import withOrientation from './withOrientation';


import home_background from 'images/barnes-v2-landing.png';
import barnes_logo from 'images/barnes-logo.png';
import barnes_kf_logo from 'images/barnes-knight-foundation-logo.png';
import cross from 'images/cross.png';

import { SNAP_LANGUAGE_PREFERENCE, SNAP_ATTEMPTS, SNAP_LAST_TIMESTAMP, SNAP_USER_EMAIL, SNAP_APP_RESET_INTERVAL, SNAP_LANGUAGE_TRANSLATION } from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome, osVersion } from 'react-device-detect';



class HomeComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            snapAttempts: localStorage.getItem(SNAP_ATTEMPTS) || 0,
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
        let last_snap_timestamp = parseInt(localStorage.getItem(SNAP_LAST_TIMESTAMP));
        if (last_snap_timestamp) {
            let ttl = (last_snap_timestamp + parseInt(SNAP_APP_RESET_INTERVAL)) - Date.now();
            if (ttl <= 0) {
                localStorage.setItem(SNAP_LAST_TIMESTAMP, Date.now());

                localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
                localStorage.removeItem(SNAP_USER_EMAIL);
                localStorage.removeItem(SNAP_ATTEMPTS);
            }
        }
    }

    /* checkForGetUserMedia = () => {
        console.log('iOS was detected');
        ReactModal.setAppElement('#app');

        // navigator.mediaDevices.getUserMedia() is only supported on iOS > 11.0 and only on Safari (not Chrome, Firefox, etc.)
        if (isIOS && (osVersion >= 11.0)) {
            if (!isSafari) {
                return <ReactModal isOpen={true} className="Modal">
                    <div className="browser-modal">
                        <div>
                            <p className="safari-text">Please use Safari while we work on compatibility with other browsers.</p>
                            <p className="safari-text">Copy the address and open it in Safari</p>
                            <button onClick={this.copyUrlToClipboard}>
                                <span className="safari-link">Tap to copy the website address</span>
                                <input type="text" value="https://snap.barnesfoundation.org" id="link-text" style={{
                                    position: 'absolute',
                                    left: '-999em'
                                }} readOnly={false} contentEditable={true} />
                            </button>
                        </div>
                    </div>
                </ReactModal>
            }
        }

        // If they're not on iOS 11, it doesn't matter what browser they're using, navigator.mediaDevices.getUserMedia() will return undefined
        else {
            return <ReactModal isOpen={true} className="Modal">
                <div className="browser-modal">
                    {<p className="safari-text">Please upgrade to iOS 11 to use the Snap app with Safari</p>}
                </div>
            </ReactModal>
        } 
    } */

    /* copyUrlToClipboard = () => {
        console.log('Copy clicked');
        let copyText = document.getElementById("link-text");
        let range = document.createRange();

        copyText.readOnly = false;
        copyText.contentEditable = true;
        range.selectNodeContents(copyText);

        let s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);

        copyText.setSelectionRange(0, 999999);
        document.execCommand('copy');

        // clipboard.writeText('https://snap.barnesfoundation.org');
    } */

    componentWillMount() {
        // Reset barnesfoc.us application if last_snap_timestamp is more than 24 hrs
        this.resetSnapApp();

        //screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || screen.orientation.lock;

        // screen.lockOrientationUniversal("portrait").then((result) => {
        //     console.log('Successfully locked Screen to Portrait mode');
        // }, (error) => {
        //     console.log('Screen lock failed. ' + error);
        // });
    }

    componentDidMount() {

        if (process.env.CROP_IMAGE === 'TRUE') {
            console.log('Image crop will be applied');
        } else {
            console.log('Image crop will not be applied');
        }

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

    onSelectLanguage = (lang) => {
        console.log('Selected lang changed in Home component : ' + JSON.stringify(lang));
        this.setState({ selectedLanguage: lang });

        /* axios.get('/api/translations?language=' + lang.code)
            .then(response => {
                console.log('successfully fetched translations.');
                let res = response.data;
                if (res.data.translations) {
                    let translation;
                    try {
                        this.setState({ translation: res.data.translations });
                        localStorage.setItem(SNAP_LANGUAGE_TRANSLATION, JSON.stringify(res.data.translations));
                    } catch (err) {
                        console.log('Error while parsing translations object to JSON.');
                    }

                }
            })
            .catch(error => {
                console.log('Error while fetching translations!');
            }); */
    }


    onSelectYes = () => {
        console.log('Yes, user is at Barnes!');
        navigator.mediaDevices.getUserMedia({
            video: {
                "facingMode": "environment",
                "width": 1920,
                "height": 1080
            }
        })
            .then(videoStream => {
                console.log('User permission recieved for camera access. Redirect user to /scan now.');
                // Navigate to scan page
                this.props.history.push({ pathname: '/scan' });

            })
            .catch(err => this.setState({ error: "An error occurred accessing the device camera" }));
    }

    onSelectNo = () => {
        console.log('No, user is not at Barnes!');
        this.setState({ userAtBarnes: false });
    }

    closeWindow = () => {
        console.log('window is closed');
        close();
    }

    render() {
        return (
            <div className="home-wrapper" id="home-wrapper">
                <img src={home_background} alt="home_background" style={{ width: screen.width, height: screen.height }} />
                {this.state.userAtBarnes && <div className="landing-screen">
                    <img src={barnes_logo} alt="barnes_logo" className="logo-center" />
                    <div className="user-loc-prompt">Are you at the Barnes?</div>
                    <div className="home-action">
                        <button className="action-btn" onClick={this.onSelectYes}>
                            <span className="action-text">Yes</span>
                        </button>
                        <button className="action-btn" onClick={this.onSelectNo}>
                            <span className="action-text">No</span>
                        </button>
                    </div>
                    <div className="kf-banner">
                        <img src={barnes_kf_logo} alt="knight_foundation_logo" className="kf-logo" />
                        <div className="kf-text">The Barnes Foundation collection online is made possible by generous support from The John S. and James L. Knight Foundation.</div>
                    </div>
                </div>
                }
                {!this.state.userAtBarnes &&
                    <div>
                        <div className="app-usage-alert">
                            <div className="app-usage-msg">
                                The Barnes Focus app is meant for use at the Barnes. Please come visit us soon.
                            </div>
                            <div className="visit-online-link">
                                <a href="https://www.barnesfoundation.org/" target="_blank">Visit us online.</a>
                            </div>
                        </div>
                        <div className="btn-close" onClick={this.closeWindow}>
                            <img src={cross} alt="close" />
                        </div>
                    </div>
                }

            </div >
        );
    }
}

export default compose(
    withOrientation,
    withRouter
)(HomeComponent);

