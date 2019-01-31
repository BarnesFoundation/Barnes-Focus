import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import posed from "react-pose";
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';

import * as constants from './Constants';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';
import share from 'images/share.svg';
import scan_button from 'images/scan-button.svg';
import check_email_icon from 'images/check_email.svg';
import InRoomSlider from './Slider';
import LanguageDropdown from './LanguageDropdown';
import EmailForm from './EmailForm';
import Footer from './Footer';
import About from './About';
import { Popover, PopoverBody } from 'reactstrap';

import close_icon from 'images/cross.svg';
import google_logo from 'images/google_translate.svg';
import { SearchRequestService } from '../services/SearchRequestService';


const fb_app_id = '349407548905454';

const Child = posed.div({
  enter: { y: 0, opacity: 1 },
  exit: { y: 50, opacity: 0 }
});

const Container = posed.div({
  enter: { staggerChildren: 50 },
  exit: { staggerChildren: 20, staggerDirection: -1 },
  grow: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 200,
      ease: "linear"
    }
  },
  shrink: {
    y: 10,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 100 }
  },
  closed: { x: `${screen.width}px` },
  open: { x: "0px" }
});

const PopupAnimation = posed.div({
  enter: {
    y: 0,
    opacity: 1,
    delay: 300,
    transition: {
      y: { type: 'spring', stiffness: 1000, damping: 15 },
      default: { duration: 300 }
    }
  },
  exit: {
    y: 50,
    opacity: 0,
    transition: { duration: 150 }
  }
});

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class SnapResults extends Component {


  constructor(props) {
    super(props);
    console.log('SnapResults >> constructor');

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
      ...props.location.state,  // these properties are passed on from Camera component. Contains {result}
      sharePopoverIsOpen: false,
      showEmailScreen: false,
      showAboutScreen: false,
      emailCaptured: false,
      emailCaptureAck: false,
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
      showSliderOverlay: true,
      email: localStorage.getItem(constants.SNAP_USER_EMAIL) || '',
      snapAttempts: localStorage.getItem(constants.SNAP_ATTEMPTS) || 1,
      errors: {
        email: false
      },
      selectedLanguage: this.langOptions[0]
    }

    this.sliderBackgroundCropParams = '?crop=faces,entropy&fit=crop&h=540&w=' + screen.width;
  }

  constructResultAndInRoomSlider = (search_result) => {
    if (search_result["success"]) {
      let result = {};
      let roomRecords = [];
      if (search_result["data"]["records"].length > 0) {

        let w = screen.width;
        let cropParams = '?crop=faces,entropy&fit=crop&w=' + w;

        const art_obj = search_result["data"]["records"][0];
        result['id'] = art_obj.id;
        result['title'] = art_obj.title;
        result['shortDescription'] = art_obj.shortDescription;
        result['artist'] = art_obj.people;
        result['classification'] = art_obj.classification;
        result['locations'] = art_obj.locations;
        result['medium'] = art_obj.medium;
        result['url'] = art_obj.art_url;
        result['bg_url'] = art_obj.art_url + cropParams;
        result['invno'] = art_obj.invno;
        result['displayDate'] = art_obj.displayDate;
        result['dimensions'] = art_obj.dimensions;
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
    console.log('SnapResults >> componentWillMount');
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

  onSelectLanguage = async (lang) => {
    console.log('Selected lang changed in SnapResults component : ' + JSON.stringify(lang));
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

  componentDidMount() {
    console.log('SnapResults >> componentDidMount');
    this.scrollInProgress = false;
    // Register scroll listener
    window.addEventListener('scroll', this._onScroll, true);

    if (this.state.searchResults.length > 0) {
      $("#result-card").attr("data-title", this.state.searchResults[0].title);
      $("#result-card").attr("data-artist", this.state.searchResults[0].artist);
      $("#result-card").attr("data-id", this.state.searchResults[0].id);
      $("#result-card").attr("data-invno", this.state.searchResults[0].invno);

      if (!this.state.searchResults[0].shortDescription) {
        $("#result-card").attr("data-nodesc-invno", this.state.searchResults[0].invno);
      }
    }
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
      case constants.SOCIAL_MEDIA_FACEBOOK: {
        webFallbackURL = 'https://www.facebook.com/dialog/share?app_id=' + fb_app_id + '&display=popup&href=' + encodeURIComponent(urlToShare) + '&redirect_uri=' + encodeURIComponent(window.location.href);
        //webFallbackURL = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(urlToShare) + '&redirect_uri=' + encodeURIComponent(window.location.href);
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

  render() {
    let resultsContainerStyle = (((this.state.showEmailScreen || this.state.emailCaptured) && !this.state.emailCaptureAck) || this.state.showAboutScreen) ? { filter: 'blur(10px)', transform: 'scale(1.2)' } : {};
    let emailScreenCloseBtnTop = Math.floor(455 / 667 * screen.height) + 'px';
    let footerStyle = (parseInt(this.state.snapAttempts) >= 4 && !this.state.emailCaptured && !this.state.showEmailScreen) ? {} : { position: 'fixed', bottom: `8px`, padding: 0, width: `60px`, left: `calc(50% - 30px)` }

    if (this.state.searchResults.length === 0) {
      return null;
    }
    return (
      <div>
        <Container className="container-fluid search-container" id="search-result" style={resultsContainerStyle} initialPose="exit" pose="enter">
          <div className="row">
            <div className="col-12 col-md-12">
              <div id="result-card" className="card" data-title="" data-artist="" data-id="" data-invno="" data-nodesc-invno="">
                <div className="card-top-container">
                  <div className="card-img-container">
                    <img className="card-img-top" src={this.state.searchResults[0].bg_url} alt="match_image_background" />
                  </div>
                  <div className="card-img-overlay">
                    <Child className="card-img-result">
                      <img src={this.state.searchResults[0].url} alt="match_image" />
                    </Child>
                    <Child className="card-title h1">{this.state.searchResults[0].title}</Child>
                  </div>
                </div>
                <Child className="card-body" ref={el => this.resultsContainer = el}>
                  <div className="card-info">
                    <table className="detail-table">
                      <tbody>
                        <tr>
                          <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_3')}:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].artist}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_4')}:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].title}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_5')}:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].displayDate}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_6')}:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].medium}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_7')}:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].dimensions}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="short-desc-container" ref={elem => this.shortDescContainer = elem}>
                    {this.state.searchResults[0].shortDescription && <div className="card-text paragraph">{this.state.searchResults[0].shortDescription}</div>}
                  </div>
                  {
                    this.state.searchResults[0].shortDescription &&
                    this.state.selectedLanguage.code !== 'En' &&
                    <div className="google-translate-disclaimer"><span>Translated with </span><img src={google_logo} alt="google_logo" /></div>
                  }
                  <div className="share-wrapper">
                    <div className="language-dropdown-wrapper">
                      {this.state.isLanguageDropdownOpen && <div className="language-dropdown-overlay"></div>}
                      {
                        this.state.isLanguageDropdownVisible &&
                        <div className="language-dropdown">
                          <LanguageDropdown langOptions={this.langOptions} selected={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} onShowLanguageDropdown={this._onShowLanguageDropdown} />
                        </div>
                      }
                    </div>

                    <div id="share-it" className="btn-share-result" ref={(node) => { this.target = node }} onClick={this._onClickShare}>
                      <img src={share} alt="share" />
                      <span className="text-share">{this.props.getTranslation('Result_page', 'text_1')}</span>
                    </div>
                    <Popover placement="top" isOpen={this.state.sharePopoverIsOpen} target="share-it">
                      <PopoverBody>
                        <div className="share">
                          <a data-id={constants.SOCIAL_MEDIA_TWITTER} onClick={this.nativeAppShareWithWebFallback}>
                            <i className="fa fa-lg fa-twitter" aria-hidden="true"></i>
                          </a>
                          <a data-id={constants.SOCIAL_MEDIA_FACEBOOK} onClick={this.nativeAppShareWithWebFallback}>
                            <i className="fa fa-lg fa-facebook" aria-hidden="true"></i>
                          </a>
                        </div>
                      </PopoverBody>
                    </Popover>
                  </div>
                </Child>

                {
                  this.state.showSliderOverlay &&
                  this.state.alsoInRoomResults.length > 0 &&
                  <div id="slider-overlay"></div>
                }

                {
                  this.state.alsoInRoomResults.length > 0 &&
                  <div id="slider-wrapper" className="slider-wrapper" ref={el => this.sliderContainer = el} style={this.state.slideOverStyle}>
                    <InRoomSlider alsoInRoomResults={this.state.alsoInRoomResults} blurValue={this.state.blurValue} onSelectInRoomArt={this.onSelectInRoomArt}></InRoomSlider>
                  </div>
                }

                <div className="scan-wrapper">
                  <div className="scan-button" onClick={this.handleScan} style={this.state.scanBtnStyle}>
                    <img src={scan_button} alt="scan" />
                  </div>
                </div>


                {
                  parseInt(this.state.snapAttempts) >= 4 &&
                  !this.state.emailCaptured &&
                  !this.state.showEmailScreen &&
                  <EmailForm isEmailScreen={false} onSubmitEmail={this.onSubmitEmail} />
                }

                <Footer footerStyle={footerStyle} onClickAbout={this._onClickAbout} />

              </div>

            </div>
          </div>
        </Container>


        {
          this.state.showEmailScreen &&
          !this.state.emailCaptured &&
          <div>
            <PopupAnimation className="email-popup-screen" initialPose="exit" pose="enter">
              <EmailForm isEmailScreen={true} onSubmitEmail={this.onSubmitEmail} />
              <div className="btn-close" onClick={this.closeWindow} style={{ position: `absolute`, top: `${emailScreenCloseBtnTop}` }}>
                <img src={close_icon} alt="close" onClick={() => { this._closeEmailPopupScreen() }} />
              </div>
            </PopupAnimation>
          </div>
        }

        {
          this.state.emailCaptured &&
          !this.state.emailCaptureAck &&
          <div>
            <PopupAnimation className="email-success-screen" initialPose="exit" pose="enter">
              <div className="success-icon" onClick={() => this._emailSuccessAcknowledged()}>
                <img src={check_email_icon} alt="email_success" />
              </div>
              <div className="success-message">
                {this.props.getTranslation('Bookmark_capture', 'text_4')}
              </div>
            </PopupAnimation>
          </div>
        }

        {
          this.state.showAboutScreen &&
          <div>
            <About onCloseAbout={this._onCloseAbout} />
          </div>
        }

      </div>
    );
  }
}

export default compose(
  withOrientation,
  withTranslation,
  withRouter
)(SnapResults);