import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';


import Camera from './Camera';
import { SearchResponse } from '../classes/searchResponse';
import { SearchRequestService } from '../services/SearchRequestService';
import { loadImage } from './CameraHelper';
import * as constants from './Constants';

class CameraContainer extends Component {

	sr;
	snapAttempts;

	matchFound;
	responseCounter;

	constructor() {
		super();

		this.sr = new SearchRequestService();
		this.snapAttempts = localStorage.getItem(constants.SNAP_ATTEMPTS) || 0;

		// Initialize match found and counter
		this.matchFound = false;
		this.responseCounter = 0;

		this.state = {
			shouldBeScanning: null,
			imageBlob: null,
			unsuccessfulAttempt: null,
		}
	}

	/** Starts scanning over a 3-second duration */
	beginScanning = async () => {

		// Update the snap attempts with this scan as a single attempt
		localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
		localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

		// Reset scans taken and stop any existing scanning
		this.matchFound = false;
		this.responseCounter = 0;
		this.setState({ shouldBeScanning: true, scanSeqId: Date.now(), unsuccessfulAttempt: null });
	}

	stopScanning = () => {
		this.setState({ shouldBeScanning: false });
	}

	/** Executes steps for completing a scan from image capture to determining a match */
	executeScanSteps = async () => {

		// Stop scanning if we've taken 9 scans	
		if (this.responseCounter === 9) { this.stopScanning(); }

		else {

			// Otherwise, if still no match found, continue scanning
			if (this.matchFound == false) {

				// Get image blob for the scan
				const { imageBlob } = this.state;

				// Prepare and send the request to Catchoom and parse the response
				const requestConfig = this.sr.prepareRequest(imageBlob, this.state.scanSeqId);
				const searchResponse = await this.submitRequest(requestConfig);

				const { searchSuccess, esResponse } = searchResponse;

				if (searchSuccess) {
					this.completeImageSearchRequest(searchSuccess, esResponse);
				}

				// Store the result, regardless of success or not
				this.sr.storeSearchedResult(searchResponse);

				// Complete this image search attempt if we've received 9 responses or match was found
				if (this.responseCounter == 9) {
					this.setState({ shouldBeScanning: false });
					this.completeImageSearchRequest(searchSuccess, esResponse);
				}
			}
		}
	}

	/** Submits the image search request to Catchoom */
	submitRequest = async (requestConfig) => {

		const { data } = requestConfig;
		let searchTime = null;

		try {
			// A search response will always have a search time
			const response = await axios(requestConfig);
			this.responseCounter++;
			searchTime = response.data.search_time;

			const resultsCount = response.data.results.length;

			// If a matching result was found
			if (resultsCount > 0) {

				this.matchFound = true;
				this.setState({ shouldBeScanning: false });

				const identifiedItem = response.data.results[0];
				const itemInformation = await this.processIdentifiedItem(identifiedItem);

				const { esResponse, referenceImageUrl } = itemInformation;

				return new SearchResponse(data, true, referenceImageUrl, esResponse, searchTime);
			}

			else { return new SearchResponse(data, false, null, null, searchTime); }
		}

		catch (error) { return new SearchResponse(data, false, null, null, null); }
	}

	/** Closure function so that a image match response is processed only once */
	processIdentifiedItem = (identifiedItem => {
		let executed = false;
		return async (identifiedItem) => {
			if (executed == false) {

				// We've executed this at least once
				executed = true;

				// Get the image id and reference image url
				const imageId = identifiedItem.item.name;
				const referenceImageUrl = identifiedItem.image.thumb_120;

				// Retrieve artwork information
				const esResponse = await this.sr.getArtworkInformation(imageId);

				return { esResponse, referenceImageUrl }
			}
		}
	})();

	/** Processes the completion of an image search */
	completeImageSearchRequest(searchWasSuccessful, response) {

		// If the search yielded a successful match
		if (searchWasSuccessful) {

			const { width } = screen;

			// Get the record and art url from it
			const record = response['data']['records'][0];
			const { art_url: artUrl, id } = record;

			// Load the image background first so that it gets cached for faster displaying
			const matchImage = loadImage(`${artUrl}?w=${(width - 80)}`);
			const matchImageBg = loadImage(`${artUrl}?q=0&auto=compress&crop=faces,entropy&fit=crop&w=${width}`);

			Promise.all([matchImage, matchImageBg]).then(() => {

				// Navigate to the artwork page
				this.props.history.push({
					pathname: `/artwork/${id}`,
					state: { result: response }
				});
			});
		}

		// Otherwise, if the search was not successful
		else {
			this.displaySearchFailure();
		}
	}

	/** Updates the state to show that the search did not yield a match */
	displaySearchFailure = () => {

		// Stop any ongoing scanning
		this.stopScanning();
		this.setState({ unsuccessfulAttempt: true });
	}

	/** Transitions the alert screen back to camera focus when scan button is clicked */
	resumeScanning = () => {
		this.beginScanning();
	}

	updateImageBlob = (imageBlob) => {
		this.setState({ imageBlob }, () => {
			this.executeScanSteps();
		});
	}

	componentDidMount() {
		this.beginScanning();
	}

	render() {

		const { updateImageBlob, snapAttempts, resumeScanning } = this;
		const { unsuccessfulAttempt, shouldBeScanning } = this.state;

		return (
			<Camera updateImageBlob={updateImageBlob} unsuccessfulAttempt={unsuccessfulAttempt} resumeScanning={resumeScanning} /* snapAttempts={snapAttempts} */ shouldBeScanning={shouldBeScanning} />
		)
	}
}

export default compose(
	withRouter
)
	(CameraContainer);