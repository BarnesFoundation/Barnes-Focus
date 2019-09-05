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

import { logiPhoneModel, shouldLogPermissionGrantTime } from '../helpers/googleAnalyticsHelpers';
import { resetApplication } from '../helpers/applicationHelpers';

class HomeComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			snapAttempts: localStorage.getItem(constants.SNAP_ATTEMPTS) || 0,
			selectedLanguage: '',

			userAtBarnes: null,
			unsupportedIOSVersion: null,
			unsupportedIOSBrowser: null,
			cameraAccessible: null,
		};
	}

	componentWillMount() {
		resetApplication();
	}

	componentDidMount() {
		if (isIOS) { this.checkForGetUserMedia(); }
	}

	/** Determines if navigator.mediaDevices.getUserMedia() is available on the current iOS device */
	checkForGetUserMedia = () => {
		const iOSVersion = parseFloat(osVersion);

		// navigator.mediaDevices.getUserMedia() is only supported on iOS > 11.0 and only on Safari (not Chrome, Firefox, etc.)
		if (iOSVersion >= parseFloat('11.0')) {
			if (!isSafari) { this.setState({ unsupportedIOSBrowser: true }); }
		}

		// If they're not on iOS 11, it doesn't matter what browser they're using, navigator.mediaDevices.getUserMedia() will return undefined
		else { this.setState({ unsupportedIOSVersion: true }); }
	};

	onSelectYes = async () => {

		// If this was an iOS device, log the model to Google Analytics
		if (isIOS) { logiPhoneModel() }

		try {
			const startTime = Date.now();

			// Attempt to access device camera
			await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1920, height: 1080 } });

			// Log the permission grant time if it took more than 900 ms
			shouldLogPermissionGrantTime(startTime);

			// Navigate to the scan page
			this.props.history.push({ pathname: '/scan' });
		}

		catch (error) {
			this.setState({ cameraAccessible: false });
		}
	};

	onSelectNo = () => {
		this.setState({ userAtBarnes: false });
	};

	clearUserAtBarnes = () => {
		this.setState({ userAtBarnes: null });
	};

	closeCameraErrorScreen = () => {
		// userAtBarnes needs to be nulled, since there's no screen for when they are at the Barnes but camera is not accessible
		this.setState({ cameraAccessible: null, userAtBarnes: null });
	};

	render() {
		const { unsupportedIOSBrowser, unsupportedIOSVersion } = this.state;

		// Styles
		let homeContainerStyle = unsupportedIOSBrowser || unsupportedIOSVersion ? { filter: 'blur(10px)', transform: 'scale(1.2)' } : {};
		let visitOnlineLinkStyle = localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE) === 'Ja' ? { fontSize: `18px` } : {};

		return (
			<div className="home-wrapper" id="home-wrapper" style={homeContainerStyle}>

				{/* Show the unsupported browser dialog if the browser is not supported */}
				{unsupportedIOSBrowser ? <UnsupportedDialog unsupportedIOSBrowser={true} /> : null}

				{/* Show the unsupported iOS version dialog if the iOS version is not supported */}
				{unsupportedIOSVersion ? <UnsupportedDialog unsupportedIOSVersion={true} /> : null}


				<img src={home_background} alt="home_background" style={{ width: screen.width, height: screen.height }} />

				{/* Only show the initial Welcome Screen prompt if they haven't selected any value for userAtBarnes */}
				{((this.state.userAtBarnes == null) && <div className="landing-screen">
					<img src={barnes_logo} alt="barnes_logo" className="logo-center" />
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

				{/* If the user has selected that they're not at the Barnes, show this section */}
				{(this.state.userAtBarnes === false) && (
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
						<div className="btn-close" onClick={this.clearUserAtBarnes}>
							<img src={close_icon} alt="close" />
						</div>
					</div>
				)}

				{/* If the camera is not accessible */}
				{(this.state.cameraAccessible === false) && (
					<div>
						<div className="app-usage-alert h2">
							<div className="app-usage-msg">
								{isIOS && <span>{constants.GET_USER_MEDIA_ERROR_IOS}</span>}
								{isAndroid && <span>{constants.GET_USER_MEDIA_ERROR_ANDROID}</span>}
							</div>
						</div>
						<div className="btn-close" onClick={this.closeCameraErrorScreen}>
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
