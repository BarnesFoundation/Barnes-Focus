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
                        <p className="safari-text">Please use Safari while we work on compatibility with other browsers.</p>
                    </div>
                </ReactModal>
            )
        }

        // Modal for unsupported iOS version
        if (unsupportedIOSVersion) {
            return (
                <ReactModal isOpen={true} className="Modal">
                    <div className="browser-modal">
                        <p className="safari-text">We're sorry, the version of iOS on your iPhone is not supported.</p>
                    </div>
                </ReactModal>
            )
        }
    }
}

export { UnsupportedDialog }