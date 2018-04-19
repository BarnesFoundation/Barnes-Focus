import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom';

import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class SnapNotFound extends Component {

    constructor(props) {
        super(props);
    }

    handleBackToCamera = () => {
        if(isAndroid && isChrome) {
            this.props.history.push({
                pathname: '/',
                state: {
                    launchCamera: true
                }
            });
        } else if (isIOS || (isAndroid && isFirefox)) {
            this.props.history.push({
                pathname: '/',
                state: {
                    launchCamera: true
                }
            });
        }
    } 

    render() {
        return (
            <div className="search-error-container">
                <div className="error-container">
                    <h1>Try again! We couldn't match that work of art.</h1>
                    <p>Tip: Our snap app is most successful at recognizing two-dimensional works of art like paintings.</p>
                </div >
                <div className="row">
                    <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                        <button className="btn snap-btn snap-btn-default" onClick={this.handleBackToCamera}>
                            Take photo
                        </button>
                    </div>
                </div>

            </div>
        );
    }
}

export default withRouter(SnapNotFound);