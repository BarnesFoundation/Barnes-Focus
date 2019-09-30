import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';


import Camera from './Camera';
import { StorableSearch, ImageSearchResponse } from '../classes/searchResponse';
import { SearchRequestService } from '../services/SearchRequestService';
import { loadImage } from './CameraHelper';
import * as constants from './Constants';

class CameraContainer extends Component {

	sr;
	snapAttempts;
	responseCounter;

	constructor() {
		super();

		this.sr = new SearchRequestService();
		this.snapAttempts = localStorage.getItem(constants.SNAP_ATTEMPTS) || 0;

		this.state = {
			scanSeqId: null,
			shouldBeScanning: null,
			sessionYieldedMatch: null,
		}
	}

	/** Starts a scanning session over a 3-second duration */
	beginScanning = async () => {

		// Update the snap attempts with this scan as a single attempt
		localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
		localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

		// Reset scans taken and stop any existing scanning
		this.responseCounter = 0;
		this.setState({ shouldBeScanning: true, scanSeqId: Date.now(), sessionYieldedMatch: null });
	}

	/** Executes steps for completing a scan from an image capture to determining a match */
	processImageCapture = async (imageBlob) => {

		// Only process image capture when we haven't determined if session yielded a match
		if (this.state.sessionYieldedMatch === null && this.responseCounter <= 9) {

			// Prepare and send the request to Catchoom for a response
			const imageSearchRequestConfig = this.sr.prepareRequest(imageBlob, this.state.scanSeqId);
			const imageSearchResponse = await this.sr.submitImageSearchRequest(imageSearchRequestConfig);
			
			const { data } = imageSearchRequestConfig;
			const { searchWasSuccessful, searchTime } = imageSearchResponse;
			let searchResultToStore, elasticSearchResponse = null;

			// Increment the response counter
			this.responseCounter ++;

			// If search was successful
			if (searchWasSuccessful && this.state.shouldBeScanning) {

				this.setState({ shouldBeScanning: false, sessionYieldedMatch: true });

				// Get the identified image information
				const identifiedItem = imageSearchResponse.responsePayload.results[0];
				const identifiedImageInformation = await this.sr.processIdentifiedItem(identifiedItem);

				const { esResponse, referenceImageUrl } = identifiedImageInformation;

				searchResultToStore = new StorableSearch(data, searchWasSuccessful, referenceImageUrl, esResponse, searchTime);
				elasticSearchResponse = esResponse;

				this.completeImageSearchRequest(elasticSearchResponse);
			}

			// Otherwise, when it's not successful
			else { searchResultToStore = new StorableSearch(data, searchWasSuccessful, null, elasticSearchResponse, searchTime); }

			// Store the result, regardless of success or not
			this.sr.storeSearchedResult(searchResultToStore);

			// If we've received 9 responses and haven't completed the search, the session yielded no match
			if (this.responseCounter === 9 && (this.state.sessionYieldedMatch == null) && this.state.shouldBeScanning) {
				
				// Updates the state to show that the search did not yield a match and scanning should end
				this.setState({ shouldBeScanning: false, sessionYieldedMatch: false  });
			}
		}
	}

	/** Processes the completion of successful image search */
	completeImageSearchRequest(response) {

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

	async componentDidMount() {
		await this.beginScanning();
	}

	render() {

		const { processImageCapture, snapAttempts, beginScanning } = this;
		const { sessionYieldedMatch, shouldBeScanning } = this.state;

		return (
			<Camera processImageCapture={processImageCapture} sessionYieldedMatch={sessionYieldedMatch} beginScanning={beginScanning} snapAttempts={snapAttempts} shouldBeScanning={shouldBeScanning} />
		)
	}
}

export default compose(
	withRouter
)(CameraContainer);