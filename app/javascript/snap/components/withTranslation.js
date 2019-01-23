
import React from 'react';
import { SearchRequestService } from '../services/SearchRequestService';

const withTranslation = WrappedComponent => {
    return class WithTranslation extends React.Component {

        constructor(props) {
            super(props);

            this.sr = new SearchRequestService();
            this.state = {
                translations: null,
                loaded: false
            };
        }

        async componentWillMount() {
            console.log('WithTranslation >> componentWillMount. Load the translations here');
            let translations = await this.sr.getAppTranslations();
            this.setState({ translations: translations, loaded: true });

        }

        getTranslation = (screen, textId) => {
            return this.state.translations[screen][textId].translated_content || this.state.translations[screen][textId].screen_text;
        }

        render() {
            return (
                <div>
                    {this.state.loaded && <WrappedComponent {...this.props} getTranslation={this.getTranslation} />}
                </div>
            );
        }
    }
};
export default withTranslation;