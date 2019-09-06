import axios from 'axios';
import scan_button from 'images/scan-button.svg';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { isIOS } from 'react-device-detect';
import posed from 'react-pose';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { SearchRequestService } from '../services/SearchRequestService';
import { cropPhoto } from './CameraHelper';
import * as constants from './Constants';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

import { SearchResponse } from '../classes/searchResponse';

const Container = posed.div({
  enter: { opacity: 1 },
  exit: { opacity: 0 }
});

class Camera extends Component {
  sr;
  snapAttempts;

  matchFound;
  responseCounter;
  scansTaken;

  track;
  camera_capabilities;
  scan;
  cropRect;

  constructor() {
    super();

    this.sr = new SearchRequestService();
    this.snapAttempts = localStorage.getItem(constants.SNAP_ATTEMPTS) || 0;

    // Set state variables
    this.state = {
      videoStream: null,
      frontCamera: false,
      showVideo: true,
      searchInProgress: false,
      snapAttempts: this.snapAttempts,
      cameraPermission: false,
      scanSeqId: Date.now(),
      matchError: false
    };

    // Set flag and counter
    this.matchFound = false;
    this.responseCounter = 0;
  }

  resetSnapCounter = () => {
    let last_snap_timestamp = parseInt(localStorage.getItem(constants.SNAP_LAST_TIMESTAMP));
    if (last_snap_timestamp) {
      let ttl = last_snap_timestamp + parseInt(constants.SNAP_COUNT_RESET_INTERVAL) - Date.now();
      if (ttl <= 0 && this.state.snapAttempts > 0) {
        localStorage.removeItem(constants.SNAP_ATTEMPTS);
        this.setState({ snapAttempts: 0 });
      }
    }
  }

  stopScanning = () => {

    // End the photo scan
    clearInterval(this.scan);
    this.scan = null;
  };

  /** Starts scanning over a 3-second duration */
  beginScanning = async () => {

    // Update the snap attempts with this scan as a single attempt
    localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
    localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

	// Reset scans taken and stop any existing scanning
    this.scansTaken = 0;
	this.stopScanning();

    // Capture a scan every third of a second
    this.scan = setInterval(this.executeScanSteps(), 1000 / 3);
  }

  /** Executes steps for completing a scan from image capture to determining a match */
  executeScanSteps = () => {

	// Stop scanning if we've taken 9 scans	
	if (this.scansTaken == 9) { this.stopScanning(); } 
	  
	else {
  
  	  // Otherwise, if still no match found, continue scanning
  	  if (this.matchFound == false) {
	  
		// Get image blob for the scan
	    const imageBlob = await this.captureSingleScan(); 

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
			this.completeImageSearchRequest(searchSuccess, esResponse);
		}
  	  } 
    }
  }

  /** Captures a single scan and returns blob of the scan */
  captureSingleScan = async () => {

	// Increment number of executions we've taken  
    this.scansTaken++;

    // Get image in canvas
    let canvas = this.getVideoCanvas();

    if (!canvas) return null;

    // Get the blob from canvas
    const imageBlob = await new Promise(resolve => {
      canvas.toBlob(async blob => {

		if (process.env.CROP_IMAGE === 'TRUE') {

		  // Convert the image uri to blob	
          window.URL = window.URL || window.webkitURL;
          let imageUri = window.URL.createObjectURL(blob);
          let imageBlob = await cropPhoto(imageUri);

          window.URL.revokeObjectURL(imageUri);
          resolve(imageBlob);
		} 
		
		else { resolve(blob); }
      }, 'image/jpeg');
	});
	
	return imageBlob;
  }

  /** Submits the image search request to Catchoom */
  submitRequest = async (requestConfig) => {

	const { data } = requestConfig;
    let searchTime = null;

      try {
		this.responseCounter++;

        // A search response will always have a search time
        const response = await axios(requestConfig);
		searchTime = response.data.search_time;
		
		const resultsCount = response.data.results.length;

        // If a matching result was found
        if (resultsCount > 0) {	

		  this.matchFound = true;
		  
		  const identifiedItem = response.data.results[0];
		  const itemInformation = await this.processIdentifiedItem(identifiedItem);

		  const { esResponse, referenceImageUrl } = itemInformation;
		  
		  return new SearchResponse(data, true, referenceImageUrl, esResponse, searchTime);
		}

		else { return new SearchResponse(data, false, null, null, searchTime); }
	  } 
	  
	  catch (error) {  return new SearchResponse(data, false, null, null, null); } 
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
      const matchImage = this.loadImage(`${artUrl}?w=${(width - 80)}`);
      const matchImageBg = this.loadImage(`${artUrl}?q=0&auto=compress&crop=faces,entropy&fit=crop&w=${width}`);

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


    if (!this.state.matchError) {
      this.setState({ matchError: true });
    }
  }

  loadImage = url => {
    return new Promise((resolve, reject) => {
      // Create a new image from JavaScript
      let image = new Image();
      // Bind an event listener on the load to call the `resolve` function
      image.onload = resolve;
      // If the image fails to be downloaded, we don't want the whole system
      // to collapse so we `resolve` instead of `reject`, even on error
      image.onerror = resolve;
      image.src = url;
    });
  };

  playVideo = () => {
    this.video &&
      this.video
        .play()
        .then(() => {
          const track = this.state.videoStream.getVideoTracks()[0];
          this.camera_capabilities = track.getCapabilities();
          this.beginScanning();
          requestAnimationFrame(this.drawVideoPreview);
        })
        .catch(error => {
          console.log('Cannot auto play video stream! ' + error);
        });
  };

  disablePinchZoom = event => {
    event.preventDefault();
  };

  async componentDidMount() {
    console.log('camera >> componentDidMount');

    // Since iOS 10, it no longer support "user-scalable=no" attribute.
    // Adding this, to disable page zoom on pinch on the camera page
    const cameraContainer = document.querySelector('.camera');
    cameraContainer.addEventListener('touchmove', this.disablePinchZoom, false);

    let previewBox = this.vpreview.getBoundingClientRect();

    this.cropRect = {
      x: Math.floor(previewBox.x),
      y: Math.floor(previewBox.y),
      width: Math.floor(previewBox.width),
      height: Math.floor(previewBox.height)
    };

    // Fetch the device camera
    try {
      const startTime = Date.now();
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.state.frontCamera ? 'user' : 'environment',
          width: 1920,
          height: 1080
        }
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

      this.setState({ videoStream: videoStream, cameraPermission: true });
    } catch (error) {
      this.setState({ error: 'An error occurred accessing the device camera' });
    }
  }

  stopVideo = () => {
    if (this.initVideo) {
      clearTimeout(this.initVideo);
    }
  };

  stopPreview = () => {
    if (this.drawPreview) {
      clearTimeout(this.drawPreview);
    }
  };

  componentDidUpdate() {
    this.matchFound = false;
    this.responseCounter = 0;

    // When video is able to be captured
    if (this.state.showVideo && this.state.videoStream && !this.state.matchError) {
      console.log('camera >> componentDidUpdate');

      this.video.srcObject = this.state.videoStream;

      this.stopVideo();

      this.initVideo = setTimeout(() => {
        this.playVideo();
      }, 50);

      // Reset snap attemps count if last_snap_timestamp is 12 hours or before.
      this.resetSnapCounter();
    }
  }

  componentWillUnmount() {
    console.log('camera >> componentWillUnmount');
    this.stopScanning();
    this.stopVideo();
    this.stopPreview();
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();

    const cameraContainer = document.querySelector('.camera');
    cameraContainer.removeEventListener('touchmove', this.disablePinchZoom);
  }

  /** Gets the video drawn onto the canvas */
  getVideoCanvas = () => {
    // Get the canvas
    let canvas = this.getCanvas();
    if (!this.video || !canvas) return null;

    const context = canvas.getContext('2d', { alpha: false });
    if (isIOS || !this.camera_capabilities) {
      // Draw rectangle
      let rect = this.video.getBoundingClientRect();
      let tempCanvas = document.createElement('canvas');
      let tempCtx = tempCanvas.getContext('2d', { alpha: false });

      // Draw the video onto a temporary canvas
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;
      tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);

      // Now copy the viewport image onto our original canvas
      let x = rect.x < 0 ? -rect.x : rect.x;
      let y = rect.y < 0 ? -rect.y : rect.y;

      if (x > 0 && y > 0) {
        context.drawImage(
          tempCanvas,
          Math.floor(x),
          Math.floor(y),
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
    } else {
      context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
  };

  /** Gets a blank canvas of same size as the video */
  getCanvas = () => {
    const video = this.video;
    if (video && !video.videoHeight) return null;

    if (!this.ctx) {
      const canvas = document.createElement('canvas');
      const aspectRatio = video.videoWidth / video.videoHeight;

      canvas.width = video.clientWidth;
      canvas.height = video.clientWidth / aspectRatio;

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
    }

    const { ctx, canvas } = this;

    return canvas;
  };

  /** Return a temporary canvas and context for drawing the video */
  getTempPreviewCanvas = () => {
    const rect = this.video.getBoundingClientRect();
    if (!this.tempCanvas) {
      let tempCanvas = document.createElement('canvas');
      let tempCtx = tempCanvas.getContext('2d', { alpha: false });
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;

      this.tempCanvas = tempCanvas;
      this.tempCtx = tempCtx;
    }
    const { tempCanvas, tempCtx } = this;
    return { tempCanvas, tempCtx };
  };

  /** Draws the portion of the video visible within the preview onto a canvas, in a loop. */
  drawVideoPreview = () => {
    try {
      if (!this.vpreview || this.state.matchError) {
        return null;
      }

      let { tempCanvas, tempCtx } = this.getTempPreviewCanvas();

      let previewCanvas = this.vpreview;
      let previewContext = previewCanvas.getContext('2d', { alpha: false });
      previewCanvas.width = this.cropRect.width;
      previewCanvas.height = this.cropRect.height;

      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);

      previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewContext.drawImage(
        tempCanvas,
        this.cropRect.x,
        this.cropRect.y,
        this.cropRect.width,
        this.cropRect.height,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
      );

      this.stopPreview();
      this.drawPreview = setTimeout(() => {
        requestAnimationFrame(this.drawVideoPreview);
      }, 10);
    } catch (error) {
      console.log('Error setting camera preview');
      ga('send', {
        hitType: 'event',
        eventCategory: constants.GA_EVENT_CATEGORY.CAMERA,
        eventAction: constants.GA_EVENT_ACTION.SCAN,
        eventLabel: constants.GA_EVENT_LABEL.SCANNER_MOUNT_FAILURE
      });
    }
  };

  /** Transitions the alert screen back to camera focus when scan button is clicked */
  handleScan = () => {
    console.log('Back to scan mode');
    this.setState({ matchError: false, scanSeqId: Date.now() });
  };

  render() {
    const { showVideo, matchError } = this.state;

    let videoStyle = {
      filter: `blur(25px)`,
      transform: `scale(1.2)`
    };

    return (
      <Container className="camera-container" initialPose="exit" pose="enter">
        <div className="camera">
          {showVideo && (
            <div>
              <video
                id="video"
                ref={c => (this.video = c)}
                width="100%"
                autoPlay
                playsInline
                muted
                style={videoStyle}
              />
              {!matchError && <canvas id="video-preview" ref={el => (this.vpreview = el)} />}

              <ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={100}>
                {matchError && (
                  <div id="no-match-overlay" className="no-match-overlay">
                    <div className="hint h2">
                      <span>
                        {this.props.getTranslation('No_Result_page', 'text_1')} <br />
                        {this.props.getTranslation('No_Result_page', 'text_2')}
                        <br />
                        {this.props.getTranslation('No_Result_page', 'text_3')}
                      </span>
                    </div>
                    <div
                      className="scan-button"
                      onClick={this.handleScan}
                      style={{ position: 'absolute', bottom: '37px' }}>
                      <img src={scan_button} alt="scan" />
                    </div>
                  </div>
                )}
              </ReactCSSTransitionGroup>
            </div>
          )}
        </div>
      </Container>
    );
  }
}

export default compose(
  withOrientation,
  withTranslation,
  withRouter
)(Camera);
