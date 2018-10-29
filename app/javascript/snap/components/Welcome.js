import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';

import LanguageSelect from '../components/LanguageSelect';
import Hammer from 'hammerjs';
import ReactModal from 'react-modal';

import img1 from 'images/welcome-img1.jpg';
import img2 from 'images/welcome-img2.jpg';
import img3 from 'images/welcome-img3.jpg';
import img4 from 'images/lang-img1.jpg';
import img5 from 'images/lang-img2.jpg';
import img6 from 'images/lang-img3.jpg';
import img7 from 'images/wifi-img1.jpg';
import img8 from 'images/wifi-img2.jpg';
import img9 from 'images/wifi-img3.jpg';
import photo_prompt from 'images/photo-prompt.jpg';
import icon_camera from 'images/camera_icon.svg';
import axios from 'axios';

import { SNAP_LANGUAGE_PREFERENCE, SNAP_ATTEMPTS, SNAP_LAST_TIMESTAMP, SNAP_USER_EMAIL, SNAP_APP_RESET_INTERVAL, SNAP_LANGUAGE_TRANSLATION } from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome, osVersion } from 'react-device-detect';

import loadImage from 'blueimp-load-image/js';
import clipboard from 'clipboard-polyfill';

class WelcomeComponent extends Component {

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
     * @memberof WelcomeComponent
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
        else {
            return <ReactModal isOpen={true} className="Modal">
                <div className="browser-modal">
                    {<p className="safari-text">Please upgrade to iOS 11 to use the Snap app with Safari</p>}
                </div>
            </ReactModal>
        }
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
            <div>
                {
                    !this.state.searchInProgress &&
                    <div id="snapCarousel" className="carousel slide">
                        <ol className="carousel-indicators">
                            <li data-target="#snapCarousel" data-slide-to="0" className="active"></li>
                            <li data-target="#snapCarousel" data-slide-to="1"></li>
                            <li data-target="#snapCarousel" data-slide-to="2"></li>
                            <li data-target="#snapCarousel" data-slide-to="3"></li>
                        </ol>
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                                <div className="welcome-screen">
                                    <div>
                                        {/** isIOS && this.checkForGetUserMedia() */}
                                    </div>
                                    <div className="img-gallery">
                                        <div className="gallery-item">
                                            <img src={img1} alt="img1" />
                                        </div>
                                        <div className="gallery-item">
                                            <img src={img2} alt="img2" />
                                        </div>
                                        <div className="gallery-item">
                                            <img src={img3} alt="img3" />
                                        </div>
                                    </div>
                                    <div className="content">

                                        <h1>{(this.state.translation) ? this.state.translation.Welcome_screen.text_1.translated_content : `It's a snap!`}</h1>

                                        <p>{(this.state.translation) ? this.state.translation.Welcome_screen.text_2.translated_content : `Take a photo of any work of art to get information about it.`}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="carousel-item">
                                <div className="lang-dropdown-screen">
                                    <div className="img-gallery">
                                        <div className="gallery-item">
                                            <img src={img4} alt="img4" />
                                        </div>
                                        <div className="gallery-item">
                                            <img src={img5} alt="img5" />
                                        </div>
                                        <div className="gallery-item">
                                            <img src={img6} alt="img6" />
                                        </div>
                                    </div>
                                    <div className="content">
                                        <h1>{(this.state.translation) ? this.state.translation.Language_choice.text_1.translated_content : `Please select your language.`}</h1>
                                        <LanguageSelect onSelectLanguage={this.onSelectLanguage} />
                                    </div>
                                </div>
                            </div>
                            <div className="carousel-item">
                                <div className="wifi-screen">
                                    <div className="img-gallery">
                                        <div className="gallery-item">
                                            <img src={img7} alt="wifi-img1" />
                                        </div>
                                        <div className="gallery-item">
                                            <img src={img8} alt="wifi-img2" />
                                        </div>
                                        <div className="gallery-item">
                                            <img src={img9} alt="wifi-img3" />
                                        </div>
                                    </div>
                                    <div className="content">

                                        <h1>{(this.state.translation) ? this.state.translation.Connect_wireless.text_1.translated_content : `Get connected.`}</h1>

                                        <p>{(this.state.translation) ? this.state.translation.Connect_wireless.text_2.translated_content : `For best connectivity, please connect to our free wifi: BarnesPublic.`}</p>

                                    </div>
                                </div>
                            </div>
                            <div className="carousel-item">
                                <div className="photo-prompt-screen">
                                    <div className="img-main">
                                        <img src={photo_prompt} alt="photo_prompt_main_img" />
                                    </div>
                                    <div className="content">
                                        <h1 className={(['ru', 'fr', 'de', 'it', 'ja'].indexOf(this.state.selectedLanguage.code) > -1) ? 'small' : null}>{(this.state.translation) ? this.state.translation.Instruction_snap.text_1.translated_content : `Take a photo to learn more about a work of art in our collection.`}</h1>
                                    </div>

                                    {/* {
                                        (isIOS) &&
                                        <label className="btn take-photo-btn">
                                            <input id="capture-option" ref={i => this.input = i} type="file" accept="image/*" capture="environment" onChange={this.processFile} />
                                            Take Photo
                                        <span className="icon">
                                                <img src={icon_camera} alt="camera_icon" />
                                            </span>
                                        </label>

                                    }

                                    {
                                        (isAndroid && isFirefox) &&
                                        <label className="btn take-photo-btn">
                                            <input id="capture-option" ref={i => this.input = i} type="file" accept="image/*" capture="environment" onChange={this.processFile} />
                                            Take Photo
                                            <span className="icon">
                                                <img src={icon_camera} alt="camera_icon" />
                                            </span>
                                        </label>

                                    } */}



                                    <Link className="btn take-photo-btn" to="/snap">
                                        {(this.state.translation) ? this.state.translation.Scan_photo.text_1.translated_content : `Scan photo`}
                                        <span className="icon">
                                            <img src={icon_camera} alt="camera_icon" />
                                        </span>
                                    </Link>


                                </div>

                            </div>
                        </div>
                        <a className="carousel-control-prev" href="#snapCarousel" role="button" data-slide="prev">
                            <i className="fa fa-2x fa-angle-left"></i>
                            <span className="sr-only">Previous</span>
                        </a>
                        <a className="carousel-control-next" href="#snapCarousel" role="button" data-slide="next">
                            <i className="fa fa-2x fa-angle-right"></i>
                            <span className="sr-only">Next</span>
                        </a>
                    </div >
                }
                {/* ========= Search in progress screen ============ */}
                {
                    this.state.searchInProgress &&
                    <div>
                        <div className="search-progress-container">
                            <div className="snap-spinner">
                                <PulseLoader
                                    color={'#999999'}
                                    size={20}
                                    margin={'5px'}
                                    loading={this.state.searchInProgress}
                                />
                            </div>
                            <div className="content">
                                <h1>{(this.state.translation) ? this.state.translation.Snap_searching.text_1.translated_content : `Searching`}</h1>
                                <p>{(this.state.translation) ? this.state.translation.Snap_searching.text_2.translated_content : `Please wait while we search our database.`}</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default WelcomeComponent;

