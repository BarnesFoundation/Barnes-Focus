import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { compose } from 'redux';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';

import { SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL, SOCIAL_MEDIA_TWITTER, SOCIAL_MEDIA_FACEBOOK, SOCIAL_MEDIA_INSTAGRAM, SNAP_ATTEMPTS, GA_EVENT_CATEGORY, GA_EVENT_ACTION, GA_EVENT_LABEL, SNAP_LANGUAGE_TRANSLATION } from './Constants';
import withOrientation from './withOrientation';
import axios from 'axios';
import share from 'images/share.svg';
import scan_button from 'images/scan-button.svg';
import checkmark from 'images/checkmark.png'
import InRoomSlider from './Slider';
import LanguageDropdown from './LanguageDropdown';
import EmailForm from './EmailForm';
import Popover from 'react-simple-popover';

import cross from 'images/cross.png';

const fb_app_id = '349407548905454';

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class SnapResults extends Component {


  constructor(props) {
    super(props);
    let translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);

    this.langOptions = [
      { name: 'English', code: 'En', selected: true },
      { name: 'Spanish', code: 'Es', selected: false },
      { name: 'French', code: 'Fr', selected: false },
      { name: 'Deutsch', code: 'De', selected: false },
      { name: 'Italian', code: 'It', selected: false },
      { name: 'Russian', code: 'Ru', selected: false },
      { name: 'Chinese', code: 'Zh', selected: false },
      { name: 'Japanese', code: 'Ja', selected: false },
      { name: 'Korean', code: 'Ko', selected: false }
    ];


    this.state = {
      ...props.location.state,  // these properties are passed on from Camera component.
      sharePopoverIsOpen: false,
      showEmailScreen: false,
      emailCaptured: false,
      emailCaptureAck: false,
      searchResults: [],
      alsoInRoomResults: [],
      activeSlideIndex: 0,
      blurValue: 1,
      isShortDescVisible: false,
      scanBtnStyle: {
        position: 'fixed'
      },
      langDropdownStyle: {
        position: 'fixed',
        height: '80vh',
        opacity: 0
      },
      email: localStorage.getItem(SNAP_USER_EMAIL) || '',
      resetLanguageBox: false,
      errors: {
        email: false
      },
      selectedLanguage: this.langOptions[0],
      translation: (translationObj) ? JSON.parse(translationObj) : null
    }

    // v2 class level properties
    this.sliderTopMax = 0;
    this.shortDescTopMax = 0;
    this.scrollInProgress = false;

  }

  constructResultAndInRoomSlider = (search_result) => {
    if (search_result["success"]) {
      let result = {};
      let roomRecords = [];
      if (search_result["data"]["records"].length > 0) {

        let w = screen.width;
        let cropParams = '?crop=faces,entropy&fit=crop&w=' + w;

        const art_obj = search_result["data"]["records"][0];
        console.log(art_obj);
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

      this.setState({ searchResults: [].concat(result), alsoInRoomResults: roomRecords });
    } else {
      this.setState({ error: "No records found!" });
    }
  }

  componentWillMount() {
    this.constructResultAndInRoomSlider(this.state.result)
    /**
     * If the number of scans equals 4, show the screen to capture user email.
     */
    if (parseInt(this.state.snapCount) === 4) {
      this.setState({ showEmailScreen: true });
    }
  }

  onSelectLanguage = (lang) => {
    console.log('Selected lang changed in SnapResults component : ' + JSON.stringify(lang));
    this.langOptions.map(option => {
      if (option.code === lang.code) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    })
    this.setState({ selectedLanguage: lang });

  }

  onSelectInRoomArt = (result) => {
    console.log('In room art result');
    console.log(JSON.stringify(result));

    let searchContainer = document.getElementById('search-result');
    searchContainer.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" })

    this.constructResultAndInRoomSlider(result);

  }

  componentDidMount() {
    // Register scroll listener
    window.addEventListener('scroll', this._onScroll, true);

    $("#result-card").attr("data-title", this.state.searchResults[0].title);
    $("#result-card").attr("data-artist", this.state.searchResults[0].artist);
    $("#result-card").attr("data-id", this.state.searchResults[0].id);
    $("#result-card").attr("data-invno", this.state.searchResults[0].invno);

    if (!this.state.searchResults[0].shortDescription) {
      $("#result-card").attr("data-nodesc-invno", this.state.searchResults[0].invno);
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
    let sliderElemTop = this.sliderContainer.getBoundingClientRect().y;
    let shortDescElemTop = this.shortDescContainer.getBoundingClientRect().y;
    let shortDescElemHeight = this.shortDescContainer.getBoundingClientRect().bottom - this.shortDescContainer.getBoundingClientRect().top;
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    this.sliderTopMax = (sliderElemTop > this.sliderTopMax) ? sliderElemTop : this.sliderTopMax;
    this.shortDescTopMax = (shortDescElemTop > this.shortDescTopMax) ? shortDescElemTop : this.shortDescTopMax;

    let traversedY = h + document.body.scrollTop;

    let currentSliderScrollOffset = h - sliderElemTop;
    let currentShortDescScrollOffset = h - shortDescElemTop;

    let visibleSliderHeight = (isIOS) ? Math.floor(currentSliderScrollOffset) : Math.floor(traversedY - this.sliderTopMax);
    let visibleShortDescHeight = Math.floor(currentShortDescScrollOffset);
    //let isShortDescVisible = (traversedY - this.shortDescTopMax) > 0;
    //console.log('visibleSliderHeight = ' + visibleSliderHeight);

    /**
     * Show hide scan button and language selector button if users scrolls down till shortDesc is visible in viewport.
     */
    // if ((!this.state.isShortDescVisible && isShortDescVisible) || (this.state.isShortDescVisible && !isShortDescVisible)) {
    //   this.setState({ isShortDescVisible: isShortDescVisible });
    // }

    let blur = Math.floor(visibleSliderHeight / 30);
    if (blur >= 0 && blur <= 19) {
      this.setState({ blurValue: 1 + blur });
    }

    if (visibleSliderHeight >= 520) {
      this.setState({
        scanBtnStyle: {
          position: 'absolute'
        },
        scanWrapperStyle: {
          position: 'absolute'
        }
      });
    } else {
      this.setState({
        scanBtnStyle: {
          position: 'fixed'
        }
      });
    }
    if (visibleShortDescHeight < 0) {
      this.setState({
        langDropdownStyle: {
          position: 'fixed',
          top: '80vh',
          opacity: 0
        }
      });
    }
    else if (visibleShortDescHeight > 0 && visibleShortDescHeight <= shortDescElemHeight) {
      this.setState({
        langDropdownStyle: {
          position: 'fixed',
          top: '80vh',
          opacity: 1
        }
      });
    } else if (visibleShortDescHeight > shortDescElemHeight) {
      this.setState({
        langDropdownStyle: {
          position: 'relative',
          opacity: 1,
          right: 0
        }
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

  nativeAppShareWithWebFallback = (e) => {
    const socialMediaType = e.currentTarget.dataset.id
    this.setState({ sharePopoverIsOpen: false });

    let appUriScheme;
    let webFallbackURL;
    let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.searchResults[0].id;

    switch (socialMediaType) {
      case SOCIAL_MEDIA_TWITTER: {

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
      case SOCIAL_MEDIA_FACEBOOK: {
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
      this.setState({ sharePopoverIsOpen: true });
    }

  }

  closeShareModal = () => {
    this.setState({ sharePopoverIsOpen: false });
  }

  resetExperience = () => {
    localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
    localStorage.removeItem(SNAP_USER_EMAIL);
    localStorage.removeItem(SNAP_ATTEMPTS);
    localStorage.removeItem(SNAP_LANGUAGE_TRANSLATION);
    this.setState({ translation: null });
    this.setState({ resetLanguageBox: true });
  }

  onSubmitEmail = (email) => {
    console.log('Submitted email :: ' + email);
    this.setState({ email: email, emailCaptured: true, showEmailScreen: false });

    const payload = {};
    payload.email = email;
    //payload.language = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || 'en';
    axios.post('/api/bookmarks', payload).then(response => {
      console.log('Successfully submitted email!');
    })
      .catch(error => {
        console.log('Error submitting bookmark!');
      });

  }

  handleScan = () => {
    this.props.history.push({ pathname: '/snap' });
  }

  _emailSuccessAcknowledged = () => {
    this.setState({ emailCaptureAck: true });
  }

  _closeEmailPopupScreen = () => {
    console.log('Email popup screen closed');
    this.setState({ emailCaptured: false, showEmailScreen: false });
  }

  render() {
    let resultsContainerStyle = ((this.state.showEmailScreen || this.state.emailCaptured) && !this.state.emailCaptureAck) ? { filter: 'blur(10px)', transform: 'scale(1.1)' } : {};
    let emailScreenCloseBtnTop = Math.floor(445 / 667 * screen.height) + 'px';
    return (
      <div>
        <div className="container-fluid search-container" id="search-result" style={resultsContainerStyle}>
          <div className="row">
            <div className="col-12 col-md-12">
              <div id="result-card" className="card" data-title="" data-artist="" data-id="" data-invno="" data-nodesc-invno="">
                <div className="card-top-container">
                  <div className="card-img-container">
                    <img className="card-img-top" src={this.state.searchResults[0].bg_url} alt="match_image_background" />
                  </div>
                  <div className="card-img-overlay">
                    <div className="card-img-result">
                      <img src={this.state.searchResults[0].url} alt="match_image" />
                    </div>
                    <div className="card-title">{this.state.searchResults[0].title}</div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-info">
                    <table className="detail-table">
                      <tbody>
                        <tr>
                          <td className="text-left item-label">Artist:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].artist}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">Title:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].title}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">Date:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].displayDate}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">Medium:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].medium}</td>
                        </tr>
                        <tr>
                          <td className="text-left item-label">Dimensions:</td>
                          <td className="text-left item-info">{this.state.searchResults[0].dimensions}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="short-desc-container" ref={el => this.shortDescContainer = el}>
                    {this.state.searchResults[0].shortDescription && <div className="card-text">{this.state.searchResults[0].shortDescription}</div>}
                    <div className="language-dropdown" style={this.state.langDropdownStyle}>
                      <LanguageDropdown langOptions={this.langOptions} selected={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} />
                    </div>
                  </div>
                  <div className="share-wrapper">
                    <div id="share-it" className="btn-share-result" ref="target" onClick={this._onClickShare}>
                      <img src={share} alt="share" />
                      <span className="text-share">Share</span>
                    </div>
                    <Popover
                      placement='top'
                      container={this}
                      target={this.refs.target}
                      show={this.state.sharePopoverIsOpen}
                      onHide={this.closeShareModal} >
                      <div className="share d-flex justify-content-around">
                        <a data-id={SOCIAL_MEDIA_TWITTER} onClick={this.nativeAppShareWithWebFallback}>
                          <i className="fa fa-lg fa-twitter" aria-hidden="true"></i>
                        </a>
                        <a data-id={SOCIAL_MEDIA_FACEBOOK} onClick={this.nativeAppShareWithWebFallback}>
                          <i className="fa fa-lg fa-facebook" aria-hidden="true"></i>
                        </a>
                      </div>
                    </Popover>
                  </div>
                </div>

                <div id="slider-wrapper" className="slider-wrapper" ref={el => this.sliderContainer = el} >
                  {
                    this.state.alsoInRoomResults.length > 0 &&
                    <InRoomSlider alsoInRoomResults={this.state.alsoInRoomResults} blurValue={this.state.blurValue} onSelectInRoomArt={this.onSelectInRoomArt}></InRoomSlider>
                  }


                  <div className="footer-text">
                    <span>&copy; {new Date().getFullYear()} Barnes Foundation</span>
                    <a href="https://www.barnesfoundation.org/terms"><span>Legals</span></a>
                  </div>



                  <div className="scan-wrapper" style={this.state.scanWrapperStyle}>
                    <div className="scan-button" onClick={this.handleScan} style={this.state.scanBtnStyle}>
                      <img src={scan_button} alt="scan" />
                    </div>
                  </div>
                </div>

                {
                  parseInt(this.state.snapCount) >= 4 &&
                  !this.state.emailCaptured &&
                  !this.state.showEmailScreen &&
                  <EmailForm isEmailScreen={false} onSubmitEmail={this.onSubmitEmail} />
                }


              </div>

            </div>
          </div>
        </div>


        {
          this.state.showEmailScreen &&
          <div>
            <div className="email-popup-screen">
              <EmailForm isEmailScreen={true} onSubmitEmail={this.onSubmitEmail} />
              <div className="btn-close" onClick={this.closeWindow} style={{ position: `absolute`, top: `${emailScreenCloseBtnTop}` }}>
                <img src={cross} alt="close" onClick={() => { this._closeEmailPopupScreen() }} />
              </div>
            </div>
          </div>
        }

        {
          this.state.emailCaptured &&
          !this.state.emailCaptureAck &&
          <div>
            <div className="email-success-screen">
              <div className="success-icon" onClick={() => this._emailSuccessAcknowledged()}>
                <img src={checkmark} alt="email_success" />
              </div>
              <div className="success-message">
                Thanks, we will send you all the artworks seen today at this email address: {this.state.email}
              </div>
            </div>
          </div>
        }

      </div>
    );
  }
}

export default compose(
  withOrientation,
  withRouter
)(SnapResults);