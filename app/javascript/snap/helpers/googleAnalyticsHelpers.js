import { GA_EVENT_CATEGORY, GA_EVENT_ACTION } from '../components/Constants';

// Database of possible iPhone configurations
const database = {
	'2G/3G/3GS': {
		width: 320,
		height: 480,
		ratio: 1
	},
	'4/4S': {
		width: 320,
		height: 480,
		ratio: 2
	},
	'5/5S/5C/SE': {
		width: 320,
		height: 568,
		ratio: 2
	},
	'6/6S/7/8': {
		width: 375,
		height: 667,
		ratio: 2
	},
	'6+/6S+/7+/8+': {
		width: 414,
		height: 736,
		ratio: 3
	},
	'X/XS': {
		width: 375,
		height: 812,
		ratio: 3
	},
	XR: {
		width: 414,
		height: 896,
		ratio: 2
	},
	'XS Max': {
		width: 414,
		height: 896,
		ratio: 3
	}
};

/** Returns the iPhone model being used */
const getIPhoneModel = () => {

	// Determine if iPhone is being used 
	if (/iPhone/.test(navigator.userAgent) && !window.MSStream) {

		// Get details about the current device
		const currentDeviceInfo = JSON.stringify({
			width: window.screen.width > window.screen.height ? window.screen.height : window.screen.width,
			height: window.screen.width > window.screen.height ? window.screen.width : window.screen.height,
			ratio: window.devicePixelRatio
		});

		// Loop through database to determine current device
		for (let model in database) {
			if (JSON.stringify(database[model]) == currentDeviceInfo) {
				return 'iPhone ' + model;
			}
		}
		return null;
	}
	return null;
};

/** Logs the iPhone model to Google Analytics */
export const logiPhoneModel = () => {

	const iPhoneModel = getIPhoneModel();

	// If the iPhone model was determined
	if (iPhoneModel) {

		// Log it to Google Analytics
		ga('send', {
			hitType: 'event',
			eventCategory: GA_EVENT_CATEGORY.CAMERA,
			eventAction: GA_EVENT_ACTION.DEVICE_INFO,
			eventLabel: iPhoneModel
		});
	}
}

/** Logs the permission granted to Google Analytics if it takes more than a certain time */
export const shouldLogPermissionGrantTime = (startTime) => {

	// Assuming it will take at least 1 second for user to respond to camera permission dialog
	// If the user had previously granted/rejected the permission, this promise should resolve in less than a sec
	const permissionGrantTime = Date.now() - startTime;

	if (permissionGrantTime > 900) {

		// Camera permission dialog was shown
		ga('send', {
			hitType: 'event',
			eventCategory: constants.GA_EVENT_CATEGORY.CAMERA,
			eventAction: constants.GA_EVENT_ACTION.CAMERA_PERMISSION,
			eventLabel: constants.GA_EVENT_LABEL.PERMISSION_GRANTED
		});
	}
}