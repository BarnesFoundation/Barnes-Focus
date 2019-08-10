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

const Container = posed.div({
  enter: { opacity: 1 },
  exit: { opacity: 0 }
});

class Camera extends Component {
  sr;
  snapAttempts;

  matchFound;
  responseCounter;
  intervalExecutions;

  track;
  camera_capabilities;
  camera_settings;
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
  };

  stopScan = () => {
    // End the photo scan
    clearInterval(this.scan);
    this.scan = null;
  };

  /** Captures photo over a 3-second duration */
  capturePhotoShots = () => {
    // Update the snap attempts with this scan as a single attempt
    localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
    localStorage.setItem(constants.SNAP_LAST_TIMESTAMP, Date.now());

    let prefLang = localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE) || 'en';
    this.intervalExecutions = 0;

    this.stopScan();

    // Capture a photo scan every third of a second
    this.scan = setInterval(() => {
      if (this.intervalExecutions == 9) {
        this.stopScan();
      } else {
        if (this.matchFound == false) {
          this.scanner();
        }
      }
    }, 1000 / 3);
  };

  /** Contains the logic for capturing scans */
  scanner = async () => {
    this.intervalExecutions++;

    // Get image in canvas
    let canvas = this.getVideoCanvas();

    if (!canvas) return null;

    // Get the blob from canvas
    let start = Date.now();
    const imageBlob = await new Promise(resolve => {
      canvas.toBlob(async blob => {
        //console.log('process.env.CROP_IMAGE :: ', process.env.CROP_IMAGE);
        if (process.env.CROP_IMAGE === 'TRUE') {
          window.URL = window.URL || window.webkitURL;
          let imageUri = window.URL.createObjectURL(blob);
          let imageBlob = await cropPhoto(imageUri);

          window.URL.revokeObjectURL(imageUri);
          resolve(imageBlob);
        } else {
          resolve(blob);
        }
      }, 'image/jpeg');
    });
    let end = Date.now();

    //console.log('Blob creation time: ' + (end - start) + ' ms');
    const requestConfig = this.sr.prepareRequest(imageBlob, this.state.scanSeqId);
    this.submitSearchRequest(requestConfig);
  };

  /** Submits the image search request to the server */
  submitSearchRequest = async requestConfig => {
    const { data } = requestConfig;
    let response;

    let searchSuccess;
    let referenceImageUrl = null;
    let esResponse = null;
    let searchTime = null;

    if (this.matchFound == false) {
      try {
        // A match/no match will always have a search time
        response = await axios(requestConfig);
        searchTime = response.data.search_time;

        // If a match was found
        if (response.data.results.length > 0) {
          this.matchFound = true;
          let matchData = await this.processImageMatch(response);

          searchSuccess = true;
          esResponse = matchData.esResponse;
          referenceImageUrl = matchData.referenceImageUrl;

          this.completeImageSearchRequest(searchSuccess, esResponse);
        } else {
          searchSuccess = false;
        }
      } catch (error) {
        searchSuccess = false;
      } finally {
        this.responseCounter++;

        // Store the result, regardless of success or not
        this.sr.storeSearchedResult(searchSuccess, data, referenceImageUrl, esResponse, searchTime);

        // Complete this image search attempt if we've received 9 responses or match was found
        if (this.responseCounter == 9) {
          this.completeImageSearchRequest(searchSuccess, esResponse);
        }
      }
    }
  };

  /** Closure function so that a image match response is processed only once */
  processImageMatch = (response => {
    let executed = false;
    return async response => {
      if (!executed) {
        executed = true;

        // Get the image id
        let imageId = response.data.results[0].item.name;
        let referenceImageUrl = response.data.results[0].image.thumb_120;

        // Retrieve artwork information
        let artworkInfo = await this.sr.getArtworkInformation(imageId);

        return {
          esResponse: artworkInfo,
          referenceImageUrl: referenceImageUrl
        };
      }
    };
  })();

  /** Processes the completion of an image search */
  completeImageSearchRequest(searchSuccess, response) {
    if (searchSuccess) {
      const w = screen.width;
      let artUrl = response['data']['records'][0].art_url;
      // load the match image background first so that it gets cached for faster display.
      let matchImage = this.loadImage(artUrl + '?w=' + (w - 80));
      let matchImageBg = this.loadImage(artUrl + '?q=0&auto=compress&crop=faces,entropy&fit=crop&w=' + w);

      Promise.all([matchImage, matchImageBg]).then(() => {
        // Navigate to results page
        this.props.history.push({
          pathname: `/artwork/${response['data']['records'][0].id}`,
          state: { result: response }
        });
      });
    } else {
      this.handleSnapFailure();
    }
  }

  /** Transitions to an alert screen when no match is found */
  handleSnapFailure = () => {
    this.stopScan();

    if (!this.state.matchError) {
      this.setState({ matchError: true });
    }
  };

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
          this.track = this.state.videoStream.getVideoTracks()[0];
          this.camera_capabilities = this.track.getCapabilities();
          this.camera_settings = this.track.getSettings();
          this.capturePhotoShots();
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
    this.initVideo && clearTimeout(this.initVideo);
  };

  stopPreview = () => {
    this.drawPreview && clearTimeout(this.drawPreview);
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
    this.stopScan();
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
