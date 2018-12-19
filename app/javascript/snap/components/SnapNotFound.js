import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom';

import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';
import { SNAP_LANGUAGE_TRANSLATION } from './Constants';

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class SnapNotFound extends Component {

    constructor(props) {
        super(props);
        let translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);

        this.state = {
            translation: (translationObj) ? JSON.parse(translationObj) : null
        }
    }

    handleBackToCamera = () => {
        this.props.history.push({
            pathname: '/snap'
        });
    }

    render() {
        return (
            <div className="search-error-container">
                <div className="error-container">
                    <h1>{(this.state.translation) ? this.state.translation.Snap_fail.text_1.translated_content : `Try again! We couldn't match that work of art.`}</h1>
                    <p>{(this.state.translation) ? this.state.translation.Snap_fail.text_1.translated_content : `Tip: Our snap app is most successful at recognizing two-dimensional works of art like paintings.`}</p>
                </div >
                <div className="row">
                    <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                        <button className="btn snap-btn snap-btn-default" onClick={this.handleBackToCamera}>
                            Scan photo
                        </button>
                    </div>
                </div>

            </div>
        );
    }
}

export default withRouter(SnapNotFound);