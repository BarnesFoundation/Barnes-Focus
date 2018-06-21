import React, { Component } from 'react';
import Modal from 'react-modal';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_LANGUAGE_TRANSLATION } from './Constants';

/** 
 * withLanguageSelect HOC provides props with location, history and match objects
*/
class LanguageSelect extends Component {

    constructor(props) {
        super(props);

        const langOptions = [
            { name: 'English (Default)', code: 'en' },
            { name: '中文', code: 'zh' },
            { name: 'Français', code: 'fr' },
            { name: 'Deutsch', code: 'de' },
            { name: 'Italiano', code: 'it' },
            { name: '日本語', code: 'ja' },
            { name: '한국어', code: 'ko' },
            { name: 'русский', code: 'ru' },
            { name: 'Español', code: 'es' }
        ];

        const lang = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || 'en';
        const langObj = langOptions.filter(obj => obj.code === lang);

        let translationObj = localStorage.getItem(SNAP_LANGUAGE_TRANSLATION);

        this.state = {
            selectedLanguage: langObj[0],
            modalIsOpen: false,
            languageOptions: langOptions,
            translation: (translationObj) ? JSON.parse(translationObj) : null
        }
    }

    componentDidMount() {
        Modal.setAppElement('#language-select');
        if (this.props.onSelectLanguage) {
            this.props.onSelectLanguage(this.state.selectedLanguage);
        }
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    }

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    }

    selectLanguage = (e) => {
        var selectedLang = { code: e.currentTarget.dataset.id, name: e.currentTarget.dataset.lang };
        this.setState({ selectedLanguage: selectedLang });
        localStorage.setItem(SNAP_LANGUAGE_PREFERENCE, selectedLang.code);
        if (this.props.onSelectLanguage) {
            this.props.onSelectLanguage(selectedLang);
        }
        this.closeModal();
    }

    render() {
        return (
            <div id="language-select" className="language-select text-center">
                <div className="row">
                    <div className="col-12">
                        <div className="btn-group d-flex" role="group">
                            <button className="btn btn-secondary btn-lg w-100" type="button" onClick={this.openModal}>
                                {(this.props.reset) ? this.state.languageOptions[0].name : this.state.selectedLanguage.name}
                            </button>
                            <button type="button" className="btn btn-lg btn-secondary dropdown-toggle dropdown-toggle-split" onClick={this.openModal}>
                                <span className="sr-only">Toggle Dropdown</span>
                            </button>
                        </div>
                    </div>
                </div>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Language Select Modal"
                    className="Modal"
                    overlayClassName="Overlay"
                >
                    <button type="button" className="close pull-right offset-11" aria-label="Close" onClick={this.closeModal}>
                    </button>
                    <h1>{(this.state.translation) ? this.state.translation.Language_selector.text_1.translated_content : `Please select your language.`}</h1>
                    <p>{(this.state.translation) ? this.state.translation.Language_selector.text_2.translated_content : `We are using Google to help us automatically translate our text.`}</p>
                    <ul className="list-group">
                        {this.state.languageOptions.map((lang, index) => <a className="list-group-item list-group-item-action" key={index} data-lang={lang.name} data-id={lang.code} onClick={this.selectLanguage}>{lang.name} {this.state.selectedLanguage.name === lang.name ? <span className="selected-lang">Selected</span> : ''}</a>)}
                    </ul>
                </Modal>
            </div>
        );
    }
}

export default LanguageSelect;