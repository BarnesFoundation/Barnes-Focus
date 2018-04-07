import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LanguageSelect from '../components/LanguageSelect';
import share from 'images/share_icon.svg';
import bookmark from 'images/bookmark_icon.svg';
import icon_camera from 'images/camera_icon.svg';
import team_picture from 'images/team-alert.jpg';
import Modal from 'react-modal';
import Footer from './Footer';
import Popover from 'react-simple-popover';
import NotificationSystem from 'react-notification-system';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL, SOCIAL_MEDIA_TWITTER, SOCIAL_MEDIA_FACEBOOK, SOCIAL_MEDIA_INSTAGRAM } from './Constants';


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

/** 
 * withHeader HOC provides props with location, history and match objects
*/
class SnapResults extends Component {


  constructor(props) {
    super(props);
    this.state = {
      ...props.location.state,  // these properties are passed on from Camera component.
      resetModalIsOpen: false,
      bookmarkModalIsOpen: false,
      sharePopoverIsOpen: false,
      alertModalIsOpen: false,
      searchResults: [],
      email: localStorage.getItem(SNAP_USER_EMAIL) || '',
      newsletterSubscription: false,
      errors: {
        email: false
      }
    }

  }

  componentWillMount() {
    const search_result = this.state.result;
    if (search_result["success"]) {
      if (search_result["data"]["records"].length > 0) {
        const result = {};
        const art_obj = search_result["data"]["records"][0];
        const art_url = "https://barnes-image-repository.s3.amazonaws.com/images/" + art_obj['id'] + "_" + art_obj['imageSecret'] + "_n.jpg";
        result['id'] = art_obj.id;
        result['title'] = art_obj.title;
        result['shortDescription'] = art_obj.shortDescription;
        result['artist'] = art_obj.people;
        result['classification'] = art_obj.classification;
        result['locations'] = art_obj.locations;
        result['medium'] = art_obj.medium;
        result['url'] = art_url
        result['invno'] = art_obj.invno;
        result['displayDate'] = art_obj.displayDate;
        result['shortDescription'] = art_obj.shortDescription;
        this.setState({
          searchResults: this.state.searchResults.concat(result)
        });
      }

    } else {
      this.setState({ error: "No records found!" });
    }
    if (parseInt(this.state.snapCount) === 4) {
      this.state.alertModalIsOpen = true;
    }

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

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    Modal.setAppElement('.search-container');
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
          hashtag += ',' + this.state.searchResults[0].artist.split(' ').join('');
        }
        title_author = title_author.split(' ').join('+') + '. ';
        //urlToShare += '?utm_source=barnes_snap&utm_medium=twitter&utm_term=' + this.state.searchResults[0].id;
        appUriScheme = 'twitter://post?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;
        webFallbackURL = 'https://twitter.com/intent/tweet?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;

        var start = new Date().getTime(), end, elapsed;
        document.location = appUriScheme;
        end = new Date().getTime();
        elapsed = (end - start);
        if (elapsed < 1) {
          window.open(webFallbackURL, '_blank');
        }
        break;
      }
      case SOCIAL_MEDIA_FACEBOOK: {
        webFallbackURL = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(urlToShare) + '&redirect_uri=' + encodeURIComponent(window.location.href);
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
        .then(() => console.log('Successful share'))
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
    this.setState({ resetModalIsOpen: false });
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
            <div className="card">
              <img className="card-img-top" src={this.state.searchResults[0].url} alt="match_image" />
              <div className="card-img-overlay">
                <h5 className="card-title">{this.state.searchResults[0].title}</h5>
              </div>
              <Link type="button" className="btn btn-circle" to="/snap">
                <img src={icon_camera} className="profile-avatar" alt="camera" />
              </Link>
              <div className="card-body">
                <div className="d-flex justify-content-around action-icons">
                  <div id="share-it" ref="target" onClick={this.shareIt}><img src={share} alt="share" />Share it</div>
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
                      {/* <a data-id={SOCIAL_MEDIA_INSTAGRAM} onClick={this.nativeAppShareWithWebFallback}>
                            <i class="fa fa-instagram" aria-hidden="true"></i>
                          </a> */}
                    </div>
                  </Popover>
                  <div onClick={this.bookmarkIt}><img src={bookmark} alt="bookmark" />Bookmark it</div>
                  <Modal
                    isOpen={this.state.bookmarkModalIsOpen}
                    onRequestClose={this.closeBookmarkModal}
                    contentLabel="Bookmark Modal"
                    className="Modal"
                    overlayClassName="Overlay"
                  >
                    <div className="bookmark">
                      <div className="row">
                        <div className="col-12">
                          <i className="fa fa-2x fa-angle-left pull-left"></i>
                          <span className="dismiss" onClick={this.closeBookmarkModal}>
                            Go back
                                                </span>
                        </div>
                      </div>
                      <div className="title mt-3">
                        <h2>{this.state.searchResults[0].title}</h2>
                      </div>
                      <div className="picture">
                        <img src={this.state.searchResults[0].url} alt="bookmark_img" />
                      </div>
                      <div className="message">Information about the art you bookmark will be emailed to you after your visit.</div>
                      <form onSubmit={this.submitBookMark}>
                        <input type="email" placeholder="Email address" className={this.state.errors.email ? 'error form-control' : 'form-control'} name="email" value={this.state.email} onChange={this.handleBookmarkFormInputChange} />
                        <div className="checkbox">
                          <input id="newsletter-chk" type="checkbox" name="newsletterSubscription" onChange={this.handleBookmarkFormInputChange} />
                          <label htmlFor="newsletter-chk">
                            Sign up for the Barnes newsletter
                                                        </label>
                        </div>
                        <div className="row">
                          <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                            <button type="submit" className="btn snap-btn snap-btn-default">
                              Submit
                                                        </button>
                          </div>
                        </div>
                      </form>

                    </div>
                  </Modal>
                </div>
                <hr />
                <div className="card-text">
                  <p className="text-muted">{this.state.searchResults[0].artist}. {this.state.searchResults[0].title}, {this.state.searchResults[0].displayDate}. {this.state.searchResults[0].medium}</p>
                </div>
                <div className="card-text">{this.state.searchResults[0].shortDescription}.</div>
                <div className="card-text">- John House, Renoir in the Barnes Foundation.</div>
              </div>
              <div className="card-footer">
                <h2>Albert Barnes taught people to look at works of art primarily in terms of their visual relationships.</h2>
                {/* <p>Swipe for visually similar works</p> */}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <LanguageSelect />
        </div>
        <div id="reset-experience" className="row mt-5 mb-3">
          <div className="col-6 offset-3 text-center">
            <span className="reset-experience" onClick={this.openResetModal}>Reset Experience</span>
          </div>
          <Modal
            isOpen={this.state.resetModalIsOpen}
            onRequestClose={this.closeResetModal}
            contentLabel="Reset Experience Modal"
            className="Modal"
            overlayClassName="Overlay"
          >
            <div className="reset">
              <div className="row">
                <div className="col-12">
                  <i className="fa fa-2x fa-angle-left pull-left"></i>
                  <span className="dismiss" onClick={this.closeResetModal}>
                    Cancel</span>
                </div>
              </div>
              <div className="title">
                <h1>You are about to reset the Snap experience.</h1>
              </div>
              <div className="message">Warning: This will erase your bookmarked artwork, email address, and language preferences.</div>
              <div className="row action">
                <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                  <button className="btn snap-btn snap-btn-danger" onClick={this.resetExperience}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </div>

        <Footer />
        <NotificationSystem ref="notificationSystem" />
        <Modal
          isOpen={this.state.alertModalIsOpen}
          onRequestClose={this.closeAlertModal}
          contentLabel="Snap Team Alert Modal"
          style={customStyles}
          className="Modal"
          overlayClassName="Overlay"
        >
          <div className="team-alert">
            <button type="button" className="close pull-right offset-11" aria-label="Close" onClick={this.closeAlertModal}>
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
            <div className="picture">
              <img className="img-thumbnail" src={team_picture} alt="bookmark_img" />
            </div>
            <div className="message">
              <h1>Want to know even more?</h1>
              <p>Find a member of our Art team and start a conversation about any work that interests you. Our Art Team is wearing special black T-shirts.</p>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default SnapResults;