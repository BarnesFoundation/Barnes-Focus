import React, { Component } from 'react';
import ReactModal from 'react-modal';
import withTranslation from './withTranslation';

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
                            {this.props.getTranslation('UnSupported_OS_Browser_Screen', 'text_1')}
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
                            {this.props.getTranslation('UnSupported_OS_Browser_Screen', 'text_2')}
                        </div>
                    </div>
                </ReactModal>
            )
        }
    }
}

export default withTranslation(UnsupportedDialog);