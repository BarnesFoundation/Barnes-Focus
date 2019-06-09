import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';

import * as constants from './Constants';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';
import share from 'images/share.svg';
import scan_button from 'images/scan-button.svg';
import check_email_icon from 'images/check_email.svg';
import LanguageDropdown from './LanguageDropdown';
import EmailForm from './EmailForm';
import Footer from './Footer';
import About from './About';
import { Popover, PopoverBody } from 'reactstrap';

import close_icon from 'images/cross.svg';
import google_logo from 'images/google_translate.svg';
import { SearchRequestService } from '../services/SearchRequestService';
import ProgressiveImage from 'react-progressive-image';



/** 
 * withRouter HOC provides props with location, history and match objects
*/
class Artwork extends Component {


    constructor(props) {
        super(props);
        console.log('Artwork >> constructor');

        this.sr = new SearchRequestService();

        this.langOptions = [
            { name: 'English', code: 'En', selected: true },
            { name: 'Español', code: 'Es', selected: false },
            { name: 'Français', code: 'Fr', selected: false },
            { name: 'Deutsch', code: 'De', selected: false },
            { name: 'Italiano', code: 'It', selected: false },
            { name: 'русский', code: 'Ru', selected: false },
            { name: '中文', code: 'Zh', selected: false },
            { name: '日本語', code: 'Ja', selected: false },
            { name: '한국어', code: 'Ko', selected: false }
        ];

        this.state = {
            //...props.location.state,  // these properties are passed on from Camera component. Contains {result}
            result: {
                "api_data": [
                ],
                "data": {
                    "records": [
                        {
                            "id": 7007,
                            "room": "Main Room",
                            "invno": "BF14",
                            "title": "Cup of Chocolate (Femme prenant du chocolat)",
                            "medium": "Oil on canvas",
                            "people": "Pierre-Auguste Renoir",
                            "locations": "Barnes Foundation (Philadelphia), Collection Gallery, Main Room, North Wall",
                            "creditLine": "",
                            "dimensions": "Overall: 21 5/16 x 25 5/8 in. (54.1 x 65.1 cm)",
                            "displayDate": "c. 1912",
                            "imageSecret": "0ZAwvN86FoAq13N8",
                            "ensembleIndex": "1",
                            "classification": "Paintings",
                            "shortDescription": "Figures sitting at café tables were a frequent subject for impressionist painters interested in the bustling public life of modern Paris. This canvas, however, does not quite fit into that category. Renoir painted it well after his impressionist years were over, when he was living in the rural countryside of southern France. The painting shows a casually dressed figure stirring a cup of hot chocolate; lost in reverie, slumping forward, she is conveys dreamy inwardness rather than public sociability. The model is Gabrielle Renard, who worked as a nursemaid for the Renoir family and often modeled for the artist; here she is probably posing in his studio. Notice how many colors make up the white tablecloth—purple, green, blue—and how Renoir uses soft, delicate brushstrokes to create the appearance of velvety flesh. ",
                            "art_url": "https://barnes-images.imgix.net/7007_0ZAwvN86FoAq13N8_b.jpg"
                        }
                    ],
                    "roomRecords": [
                        {
                            "id": 6964,
                            "art_url": "https://barnes-images.imgix.net/6964_RehDRhZC5bQtSnko_b.jpg"
                        },
                        {
                            "id": 7020,
                            "art_url": "https://barnes-images.imgix.net/7020_f2wbizJUVJhRvCyC_b.jpg"
                        },
                        {
                            "id": 7010,
                            "art_url": "https://barnes-images.imgix.net/7010_eOCFXaKIIpWBFGrc_b.jpg"
                        },
                        {
                            "id": 7019,
                            "art_url": "https://barnes-images.imgix.net/7019_nfDkcKrMa9lLxn1W_b.jpg"
                        },
                        {
                            "id": 6981,
                            "art_url": "https://barnes-images.imgix.net/6981_BlvD0VojmGU5ETzC_b.jpg"
                        }
                    ],
                    "message": "Result found"
                },
                "success": true,
                "requestComplete": true
            },
            sharePopoverIsOpen: false,
            showEmailScreen: false,
            showAboutScreen: false,
            emailCaptured: false,
            emailCaptureAck: false,
            bgLoaded: false,
            searchResults: [],
            alsoInRoomResults: [],
            activeSlideIndex: 0,
            blurValue: 5,
            isShortDescVisible: false,
            isLanguageDropdownOpen: false,
            isLanguageDropdownVisible: false,
            scanBtnStyle: {
                position: 'fixed'
            },
            slideOverStyle: {
                position: 'fixed',
                bottom: '0'
            },
            bgImageStyle: {},
            showSliderOverlay: true,
            email: localStorage.getItem(constants.SNAP_USER_EMAIL) || '',
            snapAttempts: localStorage.getItem(constants.SNAP_ATTEMPTS) || 1,
            errors: {
                email: false
            },
            selectedLanguage: this.langOptions[0]
        }

    }

    constructResultAndInRoomSlider = (search_result) => {
        if (search_result["success"]) {
            let result = {};
            let roomRecords = [];
            if (search_result["data"]["records"].length > 0) {

                let w = screen.width;
                let artUrlParams = '?w=' + (w - 80);
                let cropParams = '?q=0&auto=compress&crop=faces,entropy&fit=crop&w=' + w;
                let topCropParams = '?q=0&auto=compress&crop=top&fit=crop&h=75&w=' + w;
                let lowQualityParams = '?q=0&auto=compress';

                const art_obj = search_result["data"]["records"][0];
                result['id'] = art_obj.id;
                result['title'] = art_obj.title;
                result['shortDescription'] = art_obj.shortDescription;
                result['artist'] = art_obj.people;
                result['classification'] = art_obj.classification;
                result['locations'] = art_obj.locations;
                result['medium'] = art_obj.medium;
                result['url'] = art_obj.art_url + artUrlParams;
                result['url_low_quality'] = art_obj.art_url + lowQualityParams;
                result['bg_url'] = art_obj.art_url + topCropParams;
                result['invno'] = art_obj.invno;
                result['displayDate'] = art_obj.displayDate;
                result['dimensions'] = art_obj.dimensions;
                result['curatorialApproval'] = (art_obj.curatorialApproval === "false") ? false : true;
            }

            if (search_result["data"]["roomRecords"].length > 0) {
                roomRecords = search_result["data"]["roomRecords"];
            }

            this.slideOverAnimationThreshold = (roomRecords.length > 0) ? 540 : 0;

            this.setState({ searchResults: [].concat(result), alsoInRoomResults: roomRecords });
        } else {
            this.setState({ error: "No records found!" });
        }
    }

    async componentWillMount() {
        console.log('Artwork >> componentWillMount');
        let imageId = this.props.match.params.imageId;
        if (this.state.result) {
            this.constructResultAndInRoomSlider(this.state.result);
        } else if (imageId) {
            let artworkInfo = await this.sr.getArtworkInformation(imageId);
            this.setState({ result: artworkInfo });
            this.constructResultAndInRoomSlider(artworkInfo);
        }

        /**
         * If the number of scans equals 4, show the screen to capture user email.
         */
        if (parseInt(this.state.snapAttempts) === 4) {
            this.setState({ showEmailScreen: true });
        }
        if (localStorage.getItem(constants.SNAP_USER_EMAIL) !== null) {
            console.log('Email already captured!');
            this.setState({ emailCaptured: true, emailCaptureAck: true });
        }

        const selectedLangCode = localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE);
        if (selectedLangCode !== null) {
            this.langOptions.map(option => {
                if (option.code === selectedLangCode) {
                    option.selected = true;
                    this.setState({ selectedLanguage: option });
                } else {
                    option.selected = false;
                }
            })
        }
    }

    onBackgroundImageLoad = () => {
        this.setState({ bgLoaded: true });
    }

    onSelectLanguage = async (lang) => {
        console.log('Selected lang changed in Artwork component : ' + JSON.stringify(lang));
        localStorage.setItem(constants.SNAP_LANGUAGE_PREFERENCE, lang.code);

        this.langOptions.map(option => {
            if (option.code === lang.code) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        })
        this.setState({ selectedLanguage: lang });

        /** Save the user selected language in the server session and call the getArtworksInfo API again to refresh the page with translated result. */
        let languageUpdated = await this.sr.saveLanguagePreference(lang.code);
        let artworkInfo = await this.sr.getArtworkInformation(this.state.searchResults[0].id);
        this.setState({ result: artworkInfo });
        this.constructResultAndInRoomSlider(artworkInfo);
    }

    onSelectInRoomArt = (aitrId) => {
        localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        this.props.history.push({ pathname: `/artwork/${aitrId}` });
    }

    /** this is done to make sure the background image doesn't overflow the tombstone bottom, 
     * since we are showing fillscreen background when page loads */
    updateBackgroundStyle = () => {
        if (this.state.bgLoaded && this.resultsContainer) {
            let { top, bottom } = this.resultsContainer.getBoundingClientRect();
            let artworkBgBottom = this.artworkBackgroundContainer.getBoundingClientRect().bottom;
            if (artworkBgBottom > bottom) {
                this.setState({ bgImageStyle: { minHeight: (Math.floor(top) + 50) } });
            }
        }
    }

    componentDidMount() {
        console.log('Artwork >> componentDidMount');
        this.scrollInProgress = false;
        // Register scroll listener
        window.addEventListener('scroll', this._onScroll, true);
    }

    componentDidUpdate() {
        setTimeout(() => {
            requestAnimationFrame(this.updateBackgroundStyle);
        }, 500);
    }

    componentWillUnmount() {
        // Un-register scroll listener
        window.removeEventListener('scroll', this._onScroll);
    }

    /**
     * All the fancy scroll animation goes here.
     */
    handleScroll = () => {
        if (!this.resultsContainer || !this.shortDescContainer) {
            this.scrollInProgress = false;
            return;
        }

        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let resultsContainerBottom = Math.ceil(h - this.resultsContainer.getBoundingClientRect().bottom);

        /** animate blur based on results container bottom position */
        let blur = Math.floor(resultsContainerBottom / 35);
        if (blur >= 0 && blur <= 15) {
            this.setState({ blurValue: 5 + blur });
        }
        //console.log('Results container bottom :: ' + resultsContainerBottom);

        /** animate slider background and scan button based on results container bottom position */
        if (resultsContainerBottom <= this.slideOverAnimationThreshold) {
            this.setState({
                slideOverStyle: {
                    position: 'fixed',
                    bottom: '0'
                },
                scanBtnStyle: {
                    position: 'fixed'
                },
                showSliderOverlay: true
            })
        }
        else {
            let scanBtnStyle = { position: 'absolute' };
            if (this.slideOverAnimationThreshold === 0) {
                scanBtnStyle.bottom = 0;
            }
            this.setState({
                slideOverStyle: {
                    position: 'relative'
                },
                scanBtnStyle: scanBtnStyle,
                showSliderOverlay: false
            })
        }

        let shortDescBoundingRect = this.shortDescContainer.getBoundingClientRect();
        let shortDescElemTop = shortDescBoundingRect.y;
        let shortDescElemHeight = shortDescBoundingRect.bottom - shortDescBoundingRect.top;
        let currentShortDescScrollOffset = h - shortDescElemTop;
        let visibleShortDescHeight = Math.floor(currentShortDescScrollOffset);

        /** animate language dropdown basen on shortDesc container position */
        if (visibleShortDescHeight < 0) {
            this.setState({
                isLanguageDropdownVisible: false,
                isLanguageDropdownOpen: false
            });
        } else if (visibleShortDescHeight > 60 && visibleShortDescHeight <= shortDescElemHeight) {
            this.setState({
                isLanguageDropdownVisible: true
            });
        } else if (visibleShortDescHeight > shortDescElemHeight + 90) {
            this.setState({
                isLanguageDropdownVisible: false,
                isLanguageDropdownOpen: false
            })
        }

        this.scrollInProgress = false;
    }

    _onScroll = (event) => {
        if (!this.scrollInProgress) {
            requestAnimationFrame(this.handleScroll)
            this.scrollInProgress = true;
        }
    }

    _onClickAbout = () => {
        this.setState({ showAboutScreen: true });
    }

    _onCloseAbout = () => {
        this.setState({ showAboutScreen: false });
    }

    getFacebookShareUrl = () => {
        let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.searchResults[0].id;
        return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(urlToShare)
    }

    nativeAppShareWithWebFallback = (e) => {
        const socialMediaType = e.currentTarget.dataset.id
        this.setState({ sharePopoverIsOpen: false });

        let appUriScheme;
        let webFallbackURL;
        let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.searchResults[0].id;

        switch (socialMediaType) {
            case constants.SOCIAL_MEDIA_TWITTER: {

                let hashtag = 'barnesfoundation';

                let title_author = this.state.searchResults[0].title;
                if (this.state.searchResults[0].artist) {
                    title_author += ' by ' + this.state.searchResults[0].artist;
                    hashtag += ',' + this.state.searchResults[0].artist.split(' ').join('').split('-').join('');
                }
                title_author = title_author.split(' ').join('+');
                //urlToShare += '?utm_source=barnes_snap&utm_medium=twitter&utm_term=' + this.state.searchResults[0].id;
                //appUriScheme = 'twitter://post?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;
                webFallbackURL = 'https://twitter.com/intent/tweet?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;

                window.open(webFallbackURL, '_blank');
                break;
            }
        }

        e.preventDefault();
    }

    _onClickShare = () => {

        if (navigator.share) {
            let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.searchResults[0].id;
            let hashtag = '#barnesfoundation';

            let title_author = this.state.searchResults[0].title;
            if (this.state.searchResults[0].artist) {
                title_author += ' by ' + this.state.searchResults[0].artist;
                hashtag += ' #' + this.state.searchResults[0].artist.split(' ').join('');
            }
            title_author = title_author + '. ';

            navigator.share({
                title: 'Barnes Foundation',
                text: title_author + ' ' + hashtag,
                url: urlToShare
            })
                .then(() => {
                    console.log('Successful share');
                })
                .catch((error) => console.log('Error sharing', error));
        } else {
            this.toggleShareModal();
        }

    }

    toggleShareModal = () => {
        this.setState({ sharePopoverIsOpen: !this.state.sharePopoverIsOpen });
    }

    resetExperience = () => {
        localStorage.removeItem(constants.SNAP_LANGUAGE_PREFERENCE);
        localStorage.removeItem(constants.SNAP_USER_EMAIL);
        localStorage.removeItem(constants.SNAP_ATTEMPTS);
        localStorage.removeItem(constants.SNAP_LANGUAGE_TRANSLATION);
    }

    onSubmitEmail = (email) => {
        console.log('Submitted email :: ' + email);
        this.setState({ email: email, emailCaptured: true, showEmailScreen: false });

        // close the email success ack screen after 4 secs.
        setTimeout(() => {
            this.setState({ emailCaptureAck: true });
        }, 4000);
        this.sr.submitBookmarksEmail(email);
    }

    handleScan = () => {
        this.props.history.push({ pathname: '/scan' });
    }

    _emailSuccessAcknowledged = () => {
        this.setState({ emailCaptureAck: true });
    }

    _closeEmailPopupScreen = () => {
        console.log('Email popup screen closed');
        this.setState({ emailCaptured: false, showEmailScreen: false });
    }

    _onShowLanguageDropdown = (isOpen) => {
        this.setState({ isLanguageDropdownOpen: isOpen });
    }


    renderResult = () => {
        let { bgImageStyle } = this.state;
        let resultsContainerStyle = (((this.state.showEmailScreen || this.state.emailCaptured) && !this.state.emailCaptureAck) || this.state.showAboutScreen) ? { filter: 'blur(10px)', transform: 'scale(1.2)' } : {};
        let emailScreenCloseBtnTop = Math.floor(455 / 667 * screen.height) + 'px';
        let footerStyle = (parseInt(this.state.snapAttempts) >= 4 && !this.state.emailCaptured && !this.state.showEmailScreen) ? {} : { position: 'fixed', bottom: `8px`, padding: 0, width: `80px`, left: `calc(50% - 40px)` };

        let artwork = this.state.searchResults[0];
        return (
            <div>
                <div className="container-fluid artwork-container" id="search-result">
                    <div className="row">
                        <div className="artwork-top-bg">
                            <img className="card-img-top" src={artwork.bg_url} alt="match_image_background" />
                        </div>
                        <div className="col-12 col-md-12">
                            <div id="result-card" className="card" data-title={artwork.title} data-artist={artwork.artist} data-id={artwork.id} data-invno={artwork.invno} data-nodesc-invno={(!artwork.shortDescription) ? artwork.invno : ''}>
                                <div className="card-top-container">
                                    <div className="card-img-overlay">
                                        <div className="card-header h1">Focussed Artwork</div>
                                        <div className="card-img-result">
                                            <ProgressiveImage src={artwork.url} placeholder={artwork.url_low_quality}>
                                                {src => <img src={src} alt="match_image" />}
                                            </ProgressiveImage>
                                            {/* <img src={artwork.url} alt="match_image" /> */}
                                        </div>
                                        <div className="card-artist h2">{artwork.artist}</div>
                                        <div className="card-title h1">{artwork.title}</div>
                                    </div>
                                </div>
                                <div className="card-body" ref={el => this.resultsContainer = el}>
                                    <div className="short-desc-container" ref={elem => this.shortDescContainer = elem}>
                                        {artwork.shortDescription && <div className="card-text paragraph">{artwork.shortDescription}</div>}
                                    </div>
                                    {
                                        artwork.shortDescription &&
                                        this.state.selectedLanguage.code !== 'En' &&
                                        <div className="google-translate-disclaimer"><span>Translated with </span><img src={google_logo} alt="google_logo" /></div>
                                    }
                                    <div className="card-info">
                                        <table className="detail-table">
                                            <tbody>
                                                <tr>
                                                    <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_3')}:</td>
                                                    <td className="text-left item-info">{artwork.artist}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_4')}:</td>
                                                    <td className="text-left item-info">{artwork.title}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_5')}:</td>
                                                    <td className="text-left item-info">{artwork.displayDate}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_6')}:</td>
                                                    <td className="text-left item-info">{artwork.medium}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_7')}:</td>
                                                    <td className="text-left item-info">{artwork.dimensions}</td>
                                                </tr>
                                                {
                                                    !artwork.curatorialApproval &&
                                                    <tr>
                                                        <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_8')}:</td>
                                                        <td className="text-left item-info">{this.props.getTranslation('Result_page', 'text_9')}</td>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>


                                    <div className="share-wrapper">

                                        <div id="share-it" className="btn-share-result" ref={(node) => { this.target = node }} onClick={this._onClickShare}>
                                            <img src={share} alt="share" />
                                            <span className="text-share">
                                                {this.props.getTranslation('Result_page', 'text_1')}
                                            </span>
                                        </div>
                                        <Popover placement="top" isOpen={this.state.sharePopoverIsOpen} target="share-it">
                                            <PopoverBody>
                                                <div className="share">
                                                    <a data-id={constants.SOCIAL_MEDIA_TWITTER} onClick={this.nativeAppShareWithWebFallback}>
                                                        <i className="fa fa-lg fa-twitter" aria-hidden="true"></i>
                                                    </a>
                                                    <a target="_blank" href={this.getFacebookShareUrl()} data-id={constants.SOCIAL_MEDIA_FACEBOOK}>
                                                        <i className="fa fa-lg fa-facebook" aria-hidden="true"></i>
                                                    </a>
                                                </div>
                                            </PopoverBody>
                                        </Popover>
                                        <div className="language-dropdown-wrapper">
                                            {this.state.isLanguageDropdownOpen && <div className="language-dropdown-overlay"></div>}
                                            <div className="language-dropdown">
                                                <LanguageDropdown langOptions={this.langOptions} selected={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} onShowLanguageDropdown={this._onShowLanguageDropdown} />
                                            </div>

                                        </div>
                                    </div>
                                </div>


                                <div className="scan-wrapper">
                                    <div className="scan-button" onClick={this.handleScan} style={this.state.scanBtnStyle}>
                                        <img src={scan_button} alt="scan" />
                                    </div>
                                </div>
                                {
                                    parseInt(this.state.snapAttempts) >= 4 &&
                                    !this.state.emailCaptured &&
                                    !this.state.showEmailScreen &&
                                    <div>
                                        <EmailForm isEmailScreen={false} onSubmitEmail={this.onSubmitEmail} getTranslation={this.props.getTranslation} />
                                    </div>
                                }
                                <Footer footerStyle={footerStyle} onClickAbout={this._onClickAbout} getTranslation={this.props.getTranslation} />
                            </div>
                        </div>
                    </div>
                </div>





                {
                    this.state.showAboutScreen &&
                    <div>
                        <About onCloseAbout={this._onCloseAbout} getTranslation={this.props.getTranslation} />
                    </div>
                }
            </div>

        );
    }

    render() {
        if (this.state.searchResults.length === 0) {
            return null;
        }

        return (
            <div>
                {!this.state.bgLoaded &&
                    <div style={{ visibility: `hidden` }}>
                        <img className="card-img-top" src={this.state.searchResults[0].bg_url} alt="match_image_background" onLoad={this.onBackgroundImageLoad} />
                    </div>
                }
                {this.state.bgLoaded && this.renderResult()}
            </div>
        );
    }
}

export default compose(
    withOrientation,
    withTranslation,
    withRouter
)(Artwork);