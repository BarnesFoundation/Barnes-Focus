import React, { Component } from 'react';
import ReactModal from 'react-modal';

class UnsupportedDialog extends Component {

    constructor(props) {
        super(props);
        ReactModal.setAppElement('#app');
    }

    render() {

        const { unsupportedIOSBrowser, unsupportedIOSVersion } = this.props;

        // Modal for unsupported iOS browser
        if (unsupportedIOSBrowser) {
            return (
                <ReactModal isOpen={true} className="Modal">
                    <div className="browser-modal">
                        <div className="safari-text h2">
                            Please use Safari while we work on compatibility with other browsers.
                        </div>
                    </div>
                </ReactModal>
            )
        }

        // Modal for unsupported iOS version
        if (unsupportedIOSVersion) {
            return (
                <ReactModal isOpen={true} className="Modal">
                    <div className="browser-modal">
                        <div className="safari-text h2">
                            We're sorry, the version of iOS on your iPhone is not supported.
                        </div>
                    </div>
                </ReactModal>
            )
        }
    }
}

export { UnsupportedDialog }