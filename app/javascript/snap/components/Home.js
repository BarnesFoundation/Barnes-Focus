import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

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
        // Reset snap application if last_snap_timestamp is more than 24 hrs
        this.resetSnapApp();
    }

    componentDidMount() {

        if (process.env.CROP_IMAGE === 'TRUE') {
            console.log('Image crop will be applied');
        } else { console.log('Image crop will not be applied'); }

    }

    onSelectLanguage = (lang) => {
        console.log('Selected lang changed in Welcome component : ' + JSON.stringify(lang));
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
        // Navigate to snap page
        this.props.history.push({ pathname: '/snap' });
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
                        <div className="yes-button" onClick={this.onSelectYes}>
                            <span className="yes">Yes</span>
                        </div>
                        <div className="no-button" onClick={this.onSelectNo}>
                            <span className="no">No</span>
                        </div>
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
                                This app is meant for use at the Barnes. Please come see us soon !
                            </div>
                            <div className="visit-online-link">
                                <a href="https://collection.barnesfoundation.org/" target="_blank">Visit us online</a>
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

export default withRouter(HomeComponent);

