import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router'
import axios from 'axios';
import LanguageSelect from '../components/LanguageSelect';
import share from 'images/share.svg';
import bookmark from 'images/bookmark_icon.svg';
import icon_camera from 'images/camera_icon.svg';
import team_picture from 'images/team-alert.jpg';
import Modal from 'react-modal';
import Footer from './Footer';
import Popover from 'react-simple-popover';
import NotificationSystem from 'react-notification-system';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL, SOCIAL_MEDIA_TWITTER, SOCIAL_MEDIA_FACEBOOK, SOCIAL_MEDIA_INSTAGRAM, SNAP_ATTEMPTS, GA_EVENT_CATEGORY, GA_EVENT_ACTION, GA_EVENT_LABEL, SNAP_LANGUAGE_TRANSLATION } from './Constants';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';
import * as analytics from './Analytics';

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  content: {
    bottom: 'auto',
    margin: '8vw'
  }
};

const fb_app_id = '349407548905454';

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class SnapResults extends Component {


  constructor(props) {
    super(props);
    let translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);

    this.state = {
      ...props.location.state,  // these properties are passed on from Camera component.
      resetModalIsOpen: false,
      bookmarkModalIsOpen: false,
      sharePopoverIsOpen: false,
      alertModalIsOpen: false,
      searchResults: [],
      email: localStorage.getItem(SNAP_USER_EMAIL) || '',
      newsletterSubscription: false,
      resetLanguageBox: false,
      errors: {
        email: false
      },
      selectedLanguage: '',
      translation: (translationObj) ? JSON.parse(translationObj) : null
    }

  }

  componentWillMount() {
    const search_result = this.state.result;
    if (search_result["success"]) {
      if (search_result["data"]["records"].length > 0) {

        let h = Math.floor(0.6 * screen.height);
        let w = screen.width;

        let bh = Math.floor(0.25 * screen.height);
        let bw = Math.floor(screen.width - 32);

        let cropParams = '?crop=faces,entropy&fit=crop&h=' + h + '&w=' + w;
        let bookmarkCropParams = '?crop=faces,entropy&fit=crop&h=' + bh + '&w=' + bw;

        const result = {};
        const art_obj = search_result["data"]["records"][0];
        console.log(art_obj);
        result['id'] = art_obj.id;
        result['title'] = art_obj.title;
        result['shortDescription'] = art_obj.shortDescription;
        result['artist'] = art_obj.people;
        result['classification'] = art_obj.classification;
        result['locations'] = art_obj.locations;
        result['medium'] = art_obj.medium;
        result['url'] = art_obj.art_url + cropParams;
        result['bookmarkImageUrl'] = art_obj.art_url + bookmarkCropParams;
        result['invno'] = art_obj.invno;
        result['displayDate'] = art_obj.displayDate;
        result['dimensions'] = art_obj.dimensions;
        this.setState({
          searchResults: this.state.searchResults.concat(result)
        });
      }

    } else {
      this.setState({ error: "No records found!" });
    }
    /* Disable the art team pop-up modal entirely
    if (parseInt(this.state.snapCount) === 4) {
      this.state.alertModalIsOpen = true;
    }
    */
  }


  _addNotification = ({ success, message }) => {
    event.preventDefault();
    this
      ._notificationSystem
      .addNotification({
        message: message,
        position: "tc",
        level: success
          ? "success"
          : "error",
        autoDismiss: 3,
        dismissible: "none"
      });
  };

  onSelectLanguage = (lang) => {
    console.log('Selected lang changed in SnapResults component : ' + JSON.stringify(lang));
    this.setState({ selectedLanguage: lang });
    this.setState({ resetLanguageBox: false });

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

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    Modal.setAppElement('.search-container');

    $("#result-card").attr("data-title", this.state.searchResults[0].title);
    $("#result-card").attr("data-artist", this.state.searchResults[0].artist);
    $("#result-card").attr("data-id", this.state.searchResults[0].id);
    $("#result-card").attr("data-invno", this.state.searchResults[0].invno);

    if (!this.state.searchResults[0].shortDescription) {
      $("#result-card").attr("data-nodesc-invno", this.state.searchResults[0].invno);
    }
  }

  handleBackToCamera = () => {
    // if (isAndroid && isChrome) {
    //   this.props.history.push({
    //     pathname: '/snap'
    //   });
    // } else if (isIOS || (isAndroid && isFirefox)) {
    //   this.props.history.push({
    //     pathname: '/',
    //     state: {
    //       launchCamera: true
    //     }
    //   });
    // }

    this.props.history.push({
      pathname: '/snap'
    });
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

  bookmarkIt = () => {
    const email = localStorage.getItem(SNAP_USER_EMAIL);

    if (email) {
      this.submitBookMark();
    } else {
      this.setState({ bookmarkModalIsOpen: true });
    }
  }

  closeBookmarkModal = () => {
    this.setState({ bookmarkModalIsOpen: false });
  }

  shareIt = () => {

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
          analytics.track({ eventCategory: GA_EVENT_CATEGORY.SOCIAL, eventAction: GA_EVENT_ACTION.SOCIAL_SHARE_NAVIGATOR, eventLabel: GA_EVENT_LABEL.SOCIAL_SHARE_NAVIGATOR });
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      this.setState({ sharePopoverIsOpen: true });
    }

  }

  closeShareModal = () => {
    this.setState({ sharePopoverIsOpen: false });
  }

  submitBookMark = (event) => {
    console.log('submitting bookmark');
    analytics.track({ eventCategory: GA_EVENT_CATEGORY.SNAP, eventAction: GA_EVENT_ACTION.BOOKMARK, eventLabel: GA_EVENT_LABEL.BOOKMARK });
    // event is undefined when email is already present in localStorage and no bookmark modal is opened.
    if (event) {
      event.preventDefault();
      if (!this.validateEmail()) {
        this.setState({ errors: { email: true } });
      } else {
        this.setState({ errors: { email: false } });
        this.closeBookmarkModal();
        localStorage.setItem(SNAP_USER_EMAIL, this.state.email);

      }

    }

    const payload = {};
    payload.email = this.state.email;
    payload.image_id = this.state.searchResults[0].id;
    payload.newsletter = this.state.newsletterSubscription;
    payload.language = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || 'en';

    axios.post('/api/bookmarks', payload).then(response => {
      this._addNotification({ success: true, message: 'Bookmark created successfully.' });
      console.log('Successfully submitted bookmark!');
    })
      .catch(error => {
        this._addNotification({ success: false, message: 'Error while creating bookmark.' });
        console.log('Error submitting bookmark!');
      });
  }

  openResetModal = () => {
    this.setState({ resetModalIsOpen: true });
  }

  closeResetModal = () => {
    this.setState({ resetModalIsOpen: false });
  }

  resetExperience = () => {
    localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
    localStorage.removeItem(SNAP_USER_EMAIL);
    localStorage.removeItem(SNAP_ATTEMPTS);
    localStorage.removeItem(SNAP_LANGUAGE_TRANSLATION);
    this.setState({ resetModalIsOpen: false });
    this.setState({ translation: null });
    this.setState({ resetLanguageBox: true });
  }

  closeAlertModal = () => {
    this.setState({ alertModalIsOpen: false });
  }

  handleBookmarkFormInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

  }

  validateEmail = () => {
    const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return this.state.email.length > 0 && emailRegex.test(this.state.email);
  }

  render() {
    return (
      <div className="container-fluid search-container">

        <div className="row">
          <div className="col-12 col-md-12">
            <div id="result-card" className="card" data-title="" data-artist="" data-id="" data-invno="" data-nodesc-invno="">
              <div className="card-top-container">
                <div className="card-img-container">
                  <img className="card-img-top" src={this.state.searchResults[0].url} alt="match_image_background" />
                </div>
                <div className="card-img-overlay">
                  <div className="card-img-result">
                    <img src={this.state.searchResults[0].url} alt="match_image" />
                  </div>
                  <h3 className="card-title">{this.state.searchResults[0].title}</h3>
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
                {this.state.searchResults[0].shortDescription && <div className="card-text">{this.state.searchResults[0].shortDescription}</div>}

                <div className="share-wrapper">
                  <div id="share-it" className="btn-share-result" ref="target" onClick={this.shareIt}>
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
            </div>
          </div>
        </div>



        <Footer />

      </div>
    );
  }
}

export default withRouter(SnapResults);