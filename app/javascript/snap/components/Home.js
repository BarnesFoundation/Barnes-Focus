import home_background from 'images/barnes-v2-landing.png';
import barnes_logo from 'images/Barnes_logo.svg';
import close_icon from 'images/cross.svg';
import kf_logo from 'images/knight-foundation-logo.svg';
import React, { Component } from 'react';
import { isAndroid, isIOS, isSafari, osVersion } from 'react-device-detect';
import { withRouter } from 'react-router-dom';
import { Textfit } from 'react-textfit';
import { compose } from 'redux';
import * as constants from './Constants';
import UnsupportedDialog from './UnsupportedDialog';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

class HomeComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      snapAttempts: localStorage.getItem(constants.SNAP_ATTEMPTS) || 0,
      selectedLanguage: '',
      userAtBarnes: true,
      unsupportedIOSVersion: null,
      unsupportedIOSBrowser: null,
      getUserMediaError: false
    };
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
      let ttl = lastSnapTimestamp + parseInt(constants.SNAP_APP_RESET_INTERVAL) - Date.now();

      // Reset the application if so
      if (ttl <= 0) {
        localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

        localStorage.removeItem(constants.SNAP_LANGUAGE_PREFERENCE);
        localStorage.removeItem(constants.SNAP_USER_EMAIL);
        localStorage.removeItem(constants.SNAP_ATTEMPTS);
      }
    }
  };

  checkForGetUserMedia = () => {
    const iOSVersion = parseFloat(osVersion);

    // navigator.mediaDevices.getUserMedia() is only supported on iOS > 11.0 and only on Safari (not Chrome, Firefox, etc.)
    if (iOSVersion >= parseFloat('11.0')) {
      if (!isSafari) {
        console.log('User is on iOS ' + iOSVersion + ' but not on Safari');
        this.setState({ unsupportedIOSBrowser: true });
      }
    }

    // If they're not on iOS 11, it doesn't matter what browser they're using, navigator.mediaDevices.getUserMedia() will return undefined
    else {
      console.log('User is on iOS ' + iOSVersion + ' which is less than 11.0');
      this.setState({ unsupportedIOSVersion: true });
    }
  };

  componentWillMount() {
    // Reset barnesfoc.us application if last_snap_timestamp is more than 24 hrs
    this.resetSnapApp();
  }

  componentDidMount() {
    if (isIOS) {
      this.checkForGetUserMedia();
    }
  }

  onSelectYes = async () => {
    try {
      const startTime = Date.now();
      // Attempt to access device camera
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1920, height: 1080 }
      });

      //Assuming it will take atleast 1 sec for user to respond to camera permission dialog.
      // If the user had previously ganted/ rejected the permission, this promise should resolve in less than a sec.
      const permissionGrantTime = Date.now() - startTime;
      //console.log('Camera Permission granted in :: ', permissionGrantTime, ' ms.');
      if (permissionGrantTime > 900) {
        // dialog was shown
        ga('send', {
          hitType: 'event',
          eventCategory: constants.GA_EVENT_CATEGORY.CAMERA,
          eventAction: constants.GA_EVENT_ACTION.CAMERA_PERMISSION,
          eventLabel: constants.GA_EVENT_LABEL.PERMISSION_GRANTED
        });
      }

      // Navigate to the scan page
      this.props.history.push({ pathname: '/scan' });
    } catch (error) {
      console.log('An error occurred while accessing the device camera');
      this.setState({
        error: 'An error occurred accessing the device camera',
        getUserMediaError: true,
        userAtBarnes: false
      });
    }
  };

  onSelectNo = () => {
    this.setState({ userAtBarnes: false });
  };

  navigateBackToHome = () => {
    this.setState({ userAtBarnes: true });
  };

  _onClickCloseUserMediaErrorScreen = () => {
    this.setState({ getUserMediaError: false, userAtBarnes: true });
  };

  render() {
    const { unsupportedIOSBrowser, unsupportedIOSVersion } = this.state;
    let homeContainerStyle =
      unsupportedIOSBrowser || unsupportedIOSVersion ? { filter: 'blur(10px)', transform: 'scale(1.2)' } : {};
    let visitOnlineLinkStyle =
      localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE) === 'Ja' ? { fontSize: `18px` } : {};
    return (
      <div className="home-wrapper" id="home-wrapper" style={homeContainerStyle}>
        {unsupportedIOSBrowser ? <UnsupportedDialog unsupportedIOSBrowser={true} /> : null}
        {unsupportedIOSVersion ? <UnsupportedDialog unsupportedIOSVersion={true} /> : null}
        <img src={home_background} alt="home_background" style={{ width: screen.width, height: screen.height }} />
        {this.state.userAtBarnes && !this.state.getUserMediaError && (
          <div className="landing-screen">
            <img src={barnes_logo} alt="barnes_logo" className="logo-center" />
            {/* <div className="user-loc-prompt">Are you at <br />the Barnes?</div> */}
            <div className="user-loc-prompt">
              {this.props.getTranslation('Welcome_screen', 'text_1')} <br />
              {this.props.getTranslation('Welcome_screen', 'text_2')}
            </div>
            <div className="home-action">
              <button className="action-btn" onClick={this.onSelectYes}>
                <span className="action-text h2">
                  <Textfit mode="single" max={25}>
                    {this.props.getTranslation('Welcome_screen', 'text_3')}
                  </Textfit>
                </span>
              </button>
              <button className="action-btn" onClick={this.onSelectNo}>
                <span className="action-text h2">
                  <Textfit mode="single" max={25}>
                    {this.props.getTranslation('Welcome_screen', 'text_4')}
                  </Textfit>
                </span>
              </button>
            </div>
            <div className="kf-banner">
              <img src={kf_logo} alt="knight_foundation_logo" className="kf-logo" />
              <div className="kf-text caption">{this.props.getTranslation('About', 'text_2')}</div>
            </div>
          </div>
        )}
        {!this.state.userAtBarnes && !this.state.getUserMediaError && (
          <div>
            <div className="app-usage-alert h2">
              <div className="app-usage-msg">
                <span>{this.props.getTranslation('Visit_soon', 'text_1')}</span>
                <span> {this.props.getTranslation('Visit_soon', 'text_2')}</span>
              </div>
              <div className="visit-online-link" style={visitOnlineLinkStyle}>
                <a href="https://www.barnesfoundation.org/" target="_blank">
                  {this.props.getTranslation('Visit_soon', 'text_3')}
                </a>
              </div>
            </div>
            <div className="btn-close" onClick={this.navigateBackToHome}>
              <img src={close_icon} alt="close" />
            </div>
          </div>
        )}

        {this.state.getUserMediaError && !this.state.userAtBarnes && (
          <div>
            <div className="app-usage-alert h2">
              <div className="app-usage-msg">
                {isIOS && <span>{constants.GET_USER_MEDIA_ERROR_IOS}</span>}
                {isAndroid && <span>{constants.GET_USER_MEDIA_ERROR_ANDROID}</span>}
              </div>
            </div>
            <div className="btn-close" onClick={this._onClickCloseUserMediaErrorScreen}>
              <img src={close_icon} alt="close" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default compose(
  withOrientation,
  withTranslation,
  withRouter
)(HomeComponent);
