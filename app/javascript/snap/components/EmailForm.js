import scan_button from 'images/scan-button.svg';
import { throttle } from 'lodash';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL, TOP_OFFSET, VIEWPORT_HEIGHT } from './Constants';

const withStoryStyles = {
  backgroundColor: '#fff',
  color: '#353535'
};

class EmailForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      floatScanBtn: false,
      emailCaptured: false,
      errors: {
        email: false
      }
    };
  }

  componentDidMount() {
    //console.log('EmailForm >> componentDidMount');
    this.scrollInProgress = false;
    // Register scroll listener
    window.addEventListener('scroll', this._onScroll, true);
  }

  componentWillUnmount() {
    // Un-register scroll listener
    window.removeEventListener('scroll', this._onScroll);
  }

  /**
   * All the fancy scroll animation goes here.
   */
  handleScroll = () => {
    if (!this.emailRef) {
      this.scrollInProgress = false;
      return;
    }
    const emailFormTop = this.emailRef.getBoundingClientRect().top;

    const floating = emailFormTop <= TOP_OFFSET * VIEWPORT_HEIGHT ? true : false;

    if (this.state.floatScanBtn !== floating) {
      this.setState({ floatScanBtn: floating });
    }

    this.scrollInProgress = false;
  };

  _onScroll = event => {
    if (!this.scrollInProgress) {
      requestAnimationFrame(throttle(this.handleScroll, 100));
      this.scrollInProgress = true;
    }
  };

  handleScan = () => {
    this.props.history.push({ pathname: '/scan' });
  };

  handleEmailInput = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  validateEmail = () => {
    const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return this.state.email.length > 0 && emailRegex.test(this.state.email);
  };

  _saveEmail = () => {
    console.log('Save email called!!');
    if (!this.validateEmail()) {
      this.setState({ errors: { email: true } });
    } else {
      console.log('Valid email. Call backend API to save email.');
      const userEmail = this.state.email;
      this.setState({ email: '', emailCaptured: true });
      localStorage.setItem(SNAP_USER_EMAIL, userEmail);
      this.props.onSubmitEmail(userEmail);
    }
  };

  setEmailRef = elem => {
    if (elem) {
      this.emailRef = elem;
      //console.log('Email Form height = ' + this.emailRef.getBoundingClientRect().height);
      const emailFormHeight = this.emailRef.getBoundingClientRect().height;
      this.props.getSize(emailFormHeight);
    }
  };

  renderEmailSuccess = () => {
    const intentStyle = this.props.withStory ? { color: `#F74E32` } : {};
    return (
      <div>
        <div className="email-intent" style={intentStyle}>
          Thank You
        </div>
        <div className="email-head">{this.props.getTranslation('Bookmark_capture', 'text_4')}</div>
      </div>
    );
  };

  renderEmailForm = () => {
    const disclaimerTop = this.props.isEmailScreen ? (this.state.errors.email ? '365px' : '300px') : '0px';
    const emailErrorFontStyle = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) === 'Ru' ? { fontSize: `12px` } : {};
    const emailHeadFontStyle = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) === 'Ru' ? { fontSize: `18px` } : {};
    const intentStyle = this.props.withStory ? { color: `#F74E32` } : {};

    return (
      <div>
        <div className="email-intent" style={intentStyle}>
          {this.props.getTranslation('Bookmark_capture', 'text_8')}
        </div>
        <div className="email-head" style={emailHeadFontStyle}>
          {this.props.getTranslation('Bookmark_capture', 'text_1')}
        </div>
        <div className="email-input">
          <form>
            <div className="input-group">
              <input
                type="email"
                placeholder={this.props.getTranslation('Bookmark_capture', 'text_2')}
                className="form-control"
                name="email"
                value={this.state.email}
                onChange={this.handleEmailInput}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  id="bookmark-submit"
                  type="button"
                  onClick={() => this._saveEmail()}>
                  {this.props.getTranslation('Bookmark_capture', 'text_7')}
                </button>
              </div>
            </div>
            {this.state.errors.email === true && (
              <div className="email-input-error caption" style={emailErrorFontStyle}>
                {this.props.getTranslation('Bookmark_capture', 'text_5')} <br />
                {this.props.getTranslation('Bookmark_capture', 'text_6')}
              </div>
            )}
          </form>
        </div>
        <div className="email-disclaimer small-paragraph" style={{ top: disclaimerTop }}>
          {this.props.getTranslation('Bookmark_capture', 'text_3')}
        </div>
      </div>
    );
  };

  render() {
    const { floatScanBtn, emailCaptured } = this.state;
    let scanBtnClass = ['scan-button'];
    if (floatScanBtn) {
      scanBtnClass.push('floating');
    }
    return (
      <div
        id="email-form"
        className="email-container"
        style={this.props.withStory ? withStoryStyles : {}}
        ref={this.setEmailRef}>
        <div className="scan-wrapper">
          <div className={scanBtnClass.join(' ')} onClick={this.handleScan}>
            <img src={scan_button} alt="scan" />
          </div>
        </div>
        {!emailCaptured && this.renderEmailForm()}
        {emailCaptured && this.renderEmailSuccess()}
      </div>
    );
  }
}

export default withRouter(EmailForm);
