import { SNAP_LAST_TIMESTAMP, SNAP_APP_RESET_INTERVAL, SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL, SNAP_ATTEMPTS } from '../components/Constants';

/* Reset application if lastSnapTimestamp is more than 24 hours */
export const resetApplication = () => {

	// Get last snap timestamp from local storage
	let lastSnapTimestamp = parseInt(localStorage.getItem(SNAP_LAST_TIMESTAMP));

	if (lastSnapTimestamp) {
		// Check if the last snap timestamp was more than the interval time ago
		let ttl = lastSnapTimestamp + parseInt(SNAP_APP_RESET_INTERVAL) - Date.now();

		// Reset the application if so
		if (ttl <= 0) {
			localStorage.setItem(SNAP_LAST_TIMESTAMP, Date.now());

			localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
			localStorage.removeItem(SNAP_USER_EMAIL);
			localStorage.removeItem(SNAP_ATTEMPTS);
		}
	}
};