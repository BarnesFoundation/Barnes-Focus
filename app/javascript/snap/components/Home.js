import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';

import LanguageSelect from './LanguageSelect';
import Hammer from 'hammerjs';
import ReactModal from 'react-modal';


import home_background from 'images/barnes-v2-landing.png';
import barnes_logo from 'images/barnes-logo.png';
import barnes_kf_logo from 'images/barnes-knight-foundation-logo.png';

import axios from 'axios';

import { SNAP_LANGUAGE_PREFERENCE, SNAP_ATTEMPTS, SNAP_LAST_TIMESTAMP, SNAP_USER_EMAIL, SNAP_APP_RESET_INTERVAL, SNAP_LANGUAGE_TRANSLATION } from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome, osVersion } from 'react-device-detect';



class HomeComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ...props.location.state, // when "Take Photo" button is clicked in /not-found or /results page in (iOS, Android/Firefox), we pass {launchCamera: true} property
            searchInProgress: false,
            snapAttempts: localStorage.getItem(SNAP_ATTEMPTS) || 0,
            selectedLanguage: '',
            translation: null,
            showBrowserModal: false
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

    checkForGetUserMedia = () => {
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
        /* else {
            return <ReactModal isOpen={true} className="Modal">
                <div className="browser-modal">
                    {<p className="safari-text">Please upgrade to iOS 11 to use the Snap app with Safari</p>}
                </div>
            </ReactModal>
        } */
    }

    copyUrlToClipboard = () => {
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
    }


    checkIndex = () => {
        const $this = $("#snapCarousel");
        if ($("#snapCarousel .carousel-inner .carousel-item:first").hasClass("active")) {
            $this.children(".carousel-control-prev").addClass('opaque');
            $this.children(".carousel-control-prev").show();
            $this.children(".carousel-control-next").show();
            $this.children(".carousel-indicators").show();
        } else if ($("#snapCarousel .carousel-inner .carousel-item:last").hasClass("active")) {

            $this.children(".carousel-control-next").hide();
            $this.children(".carousel-control-prev").hide();
            $this.children(".carousel-indicators").hide();
        } else {
            $this.children(".carousel-control-prev").removeClass('opaque');
            $this.children(".carousel-control-prev").show();
            $this.children(".carousel-control-next").show();
            $this.children(".carousel-indicators").show();
        }
    };

    componentWillMount() {
        // Reset snap application if last_snap_timestamp is more than 24 hrs
        this.resetSnapApp();
    }

    componentDidMount() {

        if (process.env.CROP_IMAGE === 'TRUE') {
            console.log('Image crop will be applied');
        } else { console.log('Image crop will not be applied'); }

        if (this.state.cameraCancelled) {
            $("#snapCarousel .carousel-inner .carousel-item:first").removeClass("active");
            $("#snapCarousel .carousel-inner .carousel-item:last").addClass("active");
        }

        this.checkIndex();

        const settings = {
            interval: false,
            wrap: false
        };
        // axios
        //     .get('/api/snaps/languages?language=en')
        //     .then((response) => {
        //         var prefLang = localStorage.getItem('barnes.snap.pref.lang') || "en";
        //         var savedLanguage = response.data.find(function (obj) { return obj.code === prefLang; });
        //         this.setState({ languageOptions: response.data, selectedLanguage: savedLanguage });
        //     })
        //     .catch((e) => {
        //         console.error(e);
        //     });

        $('#snapCarousel').carousel(settings);

        $('#snapCarousel').each(function () {
            var $carousel = $(this);
            var hammertime = new Hammer(this, {
                recognizers: [
                    [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0 }],
                    [Hammer.Pinch, { enable: true }]
                ]
            });
            hammertime.on('swipeleft', function () {
                $carousel.carousel('next');
            });
            hammertime.on('swiperight', function () {
                $carousel.carousel('prev');
            });
        });

        $('#snapCarousel').on('slid.bs.carousel', () => {
            this.checkIndex();
        })

        // NOTE: below code is to be used only when native camera capture is enabled using <input type="file".../>
        // if (this.state.launchCamera && (isIOS || (isAndroid && isFirefox))) {
        //     this.input.click();
        // }

    }

    onSelectLanguage = (lang) => {
        console.log('Selected lang changed in Welcome component : ' + JSON.stringify(lang));
        this.setState({ selectedLanguage: lang });

        axios.get('/api/translations?language=' + lang.code)
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
            });
    }

    submitPhoto = (canvas) => {
        let processedImage = canvas.toDataURL('image/jpeg');

        localStorage.setItem(SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        let prefLang = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || "en";
        axios.post('/api/snaps/search', {
            image_data: processedImage,
            language: prefLang
        }).then(response => {
            this.setState({ searchInProgress: false });
            // Navigate to search result page or not found page
            const res = response.data;
            if (res.data.records.length === 0) {
                this.props.history.push({ pathname: '/not-found' });
            } else {
                this.props.history.push({
                    pathname: '/results',
                    state: {
                        result: res,
                        snapCount: localStorage.getItem(SNAP_ATTEMPTS)
                    }
                });
            }
        })
            .catch(error => {
                this.setState({ searchInProgress: false });
                this.props.history.push({ pathname: '/not-found' });
            });

    }

    processFile = (e) => {

        this.setState({ searchInProgress: true });
        // photo was cancelled by the user, fire camera again
        if (e.target.files.length === 0) {
            this.input.click();
        }
        else {
            let file = e.target.files[0];
            let options = {
                maxWidth: screen.width,
                canvas: true,
                downsamplingRatio: 0.5,
                orientation: true
            }

            loadImage(
                file,
                this.submitPhoto,
                options
            );

        }
    }

    render() {
        return (
            <div className="home-wrapper" id="home-wrapper">
                <img src={home_background} alt="home_background" style={{ width: screen.width, height: window.innerHeight }} />
                <img src={barnes_logo} alt="barnes_logo" className="logo-center" />
                <div className="user-loc-prompt">Are you at the Barnes?</div>
                <div className="yes-button">
                    <span className="yes">Yes</span>
                </div>
                <div className="no-button">
                    <span className="no">No</span>
                </div>
                <div className="kf-banner">
                    <img src={barnes_kf_logo} alt="knight_foundation_logo" className="kf-logo" />
                    <div className="kf-text">The Barnes Foundation collection online is made possible by generous support from The John S. and James L. Knight Foundation.</div>
                </div>
            </div >
        );
    }
}

export default HomeComponent;

