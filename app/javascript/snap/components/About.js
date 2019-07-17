import close_icon from "images/cross.svg";
import kf_logo from "images/knight-foundation-logo.svg";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import withOrientation from "./withOrientation";

class AboutComponent extends Component {
  constructor(props) {
    super(props);
  }

  navigateBack = () => {
    this.props.history.goBack();
  };

  render() {
    return (
      <div className="about-wrapper">
        <div>
          <div className="kf-logo">
            <img src={kf_logo} />
          </div>
          <div className="about-text h2">
            <div className="kf-credit-line">
              {this.props.getTranslation("About", "text_2")}
            </div>
            <div className="app-version">
              {this.props.getTranslation("About", "text_3")}
            </div>
            <div className="terms-and-conditions">
              <a href="https://www.barnesfoundation.org/terms" target="_blank">
                {this.props.getTranslation("About", "text_4")}
              </a>
            </div>
          </div>
          <div className="btn-close" onClick={this.props.onCloseAbout}>
            <img src={close_icon} alt="close" />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withOrientation,
  withRouter
)(AboutComponent);
