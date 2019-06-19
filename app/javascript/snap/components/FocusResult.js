import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

import { SearchRequestService } from '../services/SearchRequestService';

import Artwork from '../components/Artwork';
import StoryItem from '../components/StoryItem';
import LanguageDropdown from '../components/LanguageDropdown';
import { Transition, animated } from 'react-spring/renderprops';
import { Swipeable } from 'react-swipeable';
import * as constants from './Constants';
import { flattenDeep, filter } from 'lodash';

/** 
 * withRouter HOC provides props with location, history and match objects
*/
const swipeableConfig = {
    delta: 10
};

class FocusResult extends Component {


    constructor(props) {
        super(props);
        console.log('FocusResult >> constructor');

        this.sr = new SearchRequestService();

        this.langOptions = [
            { name: 'English', code: 'En', selected: true },
            { name: 'Español', code: 'Es', selected: false },
            { name: 'Français', code: 'Fr', selected: false },
            { name: 'Deutsch', code: 'De', selected: false },
            { name: 'Italiano', code: 'It', selected: false },
            { name: 'русский', code: 'Ru', selected: false },
            { name: '中文', code: 'Zh', selected: false },
            { name: '日本語', code: 'Ja', selected: false },
            { name: '한국어', code: 'Ko', selected: false }
        ];

        this.state = {
            ...props.location.state,  // these properties are passed on from Camera component. Contains {result}
            index: 0,
            prevIndex: -1,
            scrollDir: constants.SCROLL_DIR.UP,
            selectedLanguage: this.langOptions[0],
            isLanguageDropdownOpen: false

        }

    }

    async componentWillMount() {
        console.log('FocusResult >> componentWillMount');
        let imageId = (this.state.result) ? this.state.result.data.records[0].id : this.props.match.params.imageId;

        const selectedLangCode = localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE);
        if (selectedLangCode !== null) {
            this.langOptions.map(option => {
                if (option.code === selectedLangCode) {
                    option.selected = true;
                } else {
                    option.selected = false;
                }
            })
        }

        const selectedLang = filter(this.langOptions, lang => lang.selected === true);
        const stories = await this.setupStory(imageId);
        this.setState({ selectedLanguage: selectedLang[0], stories: stories });

    }

    onSelectLanguage = async (lang) => {
        console.log('Selected lang changed in FocusResult component : ' + JSON.stringify(lang));
        localStorage.setItem(constants.SNAP_LANGUAGE_PREFERENCE, lang.code);

        const imageId = this.getFocusedArtworkImageId();

        this.langOptions.map(option => {
            if (option.code === lang.code) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        })

        /** Save the user selected language in the server session and call the getArtworksInfo API again to refresh the page with translated result. */
        const languageUpdated = await this.sr.saveLanguagePreference(lang.code);
        const artworkInfo = await this.sr.getArtworkInformation(imageId);
        const stories = await this.setupStory(imageId);
        this.setState({ result: artworkInfo, selectedLanguage: lang, stories: stories });
    }

    getFocusedArtworkImageId = () => {
        const imageId = (this.state.result) ? this.state.result.data.records[0].id : this.props.match.params.imageId;
        return imageId;
    }

    setupStory = async (imageId) => {
        console.log('imageid = ' + imageId);
        let w = screen.width;
        let h = screen.height;
        //return await this.sr.getStoryItems(imageId);
        return [
            {
                "id": 6964,
                "show": true,
                "height": 823,
                "art_url": "https://barnes-images.imgix.net/6964_RehDRhZC5bQtSnko_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                "title": "Mother and Child",
                "short_para": "Between 1912 and 19591, Albert C. Barnes amassed an astonishing 181 works by Pierre- Auguste Renoir. It is the largest collection in the world.",
                "info": "Young Mother (Juene mére), 1881.",
                "artist": "Pierre-Auguste Renoir."

            },
            {
                "id": 7020,
                "show": false,
                "height": 823,
                "art_url": "https://barnes-images.imgix.net/7020_f2wbizJUVJhRvCyC_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                "title": "Seated Nude",
                "short_para": "Renoir is best known for his impressionist paintings made during the 1870s. Barnes vastly preferred Renoir's latest canvases, however, because they seemed modern and classical at the same time. The 1910 nude is a good example.",
                "info": "Bather Drying Herself (Baigneuse Séssuyant). c. 1908.",
                "artist": "Pierre-Auguste Renoir."
            },
            {
                "id": 7019,
                "show": false,
                "height": 823,
                "art_url": "https://barnes-images.imgix.net/7019_nfDkcKrMa9lLxn1W_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                "title": "Jeanne-Durrand-Ruel",
                "short_para": "Barnes purchased over half of his Renoirs from Paul Durrand-Ruel, the famous impressionist dealer who had galleries in Paris and New York. This is a portrait of his daughter, Jeanne.",
                "info": "Portrait of Jeanne Durrand-Ruel(Portrait de Mlle. J.). 1876.",
                "artist": "Pierre-Auguste Renoir."
            },
            {
                "id": 6981,
                "show": false,
                "height": 823,
                "art_url": "https://barnes-images.imgix.net/6981_BlvD0VojmGU5ETzC_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                "title": "Odalisque with Tea Set",
                "short_para": "Renoir died in 1919, leaving behind more the 700 canvasses in his Cagnes-sur-Mer studio. Eager for a glimpse, Barnes travelled there in 1921 -a visit he later described as \" one of the most delightful experiences I ever had.\". He would eventually buy 41 studio painings from the Renoir sons.",
                "info": "Odalisque with Tea Set (Odalisque á la théiére)",
                "artist": "Pierre-Auguste Renoir."
            },
            null
        ];
    }


    renderStoryItem = (index, style) => {
        if (index === -1 || !this.state.stories) {
            return null;
        }

        const story = this.state.stories[index];
        const shouldRender = (index < this.state.stories.length - 1) ? true : false;
        //console.log('index = ' + index + ' && render = ' + shouldRender);
        return (shouldRender) ? <StoryItem isFirstItem={(this.state.index === 0) ? true : false} key={index} story={story} style={style} /> : null;
    }

    toggle = e =>
        this.setState(state => ({
            index: state.index === 3 ? 3 : state.index + 1,
        }));

    swiping = (e) => {
        console.log('Swiping on ')

        const classes = flattenDeep(e.event.path.map(path => {
            return path.className && path.className.split(' ');
        }));
        //console.log(classes);
        if (classes.includes('story-container')) {
            //console.log('You are scrolling over story item');
        }
    }

    swiped = (e) => {
        //console.log("You Swiped...", e, deltaX, deltaY, isFlick, velocity)

        const artwork = document.getElementById('focussed-artwork-body');
        const storyContainer = document.getElementById('story-item-container');

        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        const resultsContainerBottom = Math.ceil(h - artwork.getBoundingClientRect().bottom);
        const storyContainerBottom = Math.ceil(h - storyContainer.getBoundingClientRect().bottom);

        //console.log('resultsContainerBottom :: ' + resultsContainerBottom);
        //console.log('storyContainerBottom :: ' + storyContainerBottom);

        // when focussed artwork card is visible, index is 0
        if (this.state.index === 0) {
            //console.log('You are swiping focussed artwork');
            if (resultsContainerBottom >= 0) {
                this.setState(state => ({
                    index: 1,
                    prevIndex: 0,
                    scrollDir: constants.SCROLL_DIR.UP
                }));
            }
        } else {
            //console.log('You are swiping story item with dir = ' + e.dir);

            const newIndex = (e.dir === 'Up') ?
                ((this.state.index !== (this.state.stories.length - 1)) ? (this.state.index + 1) : this.state.index) :
                (this.state.index - 1);

            //console.log('newIndex = ' + newIndex);

            if (newIndex !== this.state.index) {
                this.setState(state => ({
                    index: newIndex,
                    prevIndex: state.index,
                    scrollDir: (e.dir === 'Up') ? constants.SCROLL_DIR.UP : constants.SCROLL_DIR.DOWN
                }));
            }

        }
    }

    render() {

        const { index, prevIndex, scrollDir, isLanguageDropdownOpen, result } = this.state;

        const zIndexCurrent = 100 * index;
        const zIndexPrev = zIndexCurrent - 100;
        const down = (scrollDir === 'DOWN') ? true : false;
        console.log('prevIndex, index, scrollDir :: ' + prevIndex, index, scrollDir);

        let yFrom, yEnter, yLeave;
        if (scrollDir === constants.SCROLL_DIR.UP) {
            yFrom = 100, yEnter = 83, yLeave = 0;
        } else {
            yFrom = 0, yEnter = 83; yLeave = 100;
        }

        return (
            <Swipeable
                onSwiping={this.swiping}
                onSwiped={this.swiped}
                {...swipeableConfig}>
                <Artwork result={result} langOptions={this.langOptions} selectedLanguage={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} />

                <div className="story-container container-fluid" id="story-item-container">
                    {/** this is to make sure that previous story item is back when we swipe down within story items. React spring doesn't keep track of previous item during transition */}
                    {
                        (index > 0) &&
                        <div className="story-item-nav row">
                            <div className="col-8 story-question">Why so many Renoirs?</div>
                            <div className="col-4 language-dropdown">
                                <LanguageDropdown isStoryItemDropDown={true} langOptions={this.langOptions} selected={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} />
                            </div>
                        </div>
                    }
                    {
                        (down) &&
                        (index > 0) &&
                        <div className="story-item static" style={{ opacity: 1, zIndex: zIndexCurrent - 1, borderRadius: `0px`, transform: `translate3d(0, 0%, 0)` }} >
                            {this.renderStoryItem(index - 1, {})}
                        </div>
                    }
                    <Transition
                        native
                        unique
                        keys={index}
                        items={index}
                        from={{ opacity: 1, transform: `translate3d(0,${yFrom}%,0)` }}
                        enter={{ opacity: 1, zIndex: zIndexCurrent, borderRadius: `40px`, transform: `translate3d(0,${yEnter}%,0)` }}
                        leave={{ opacity: 1, zIndex: zIndexPrev, borderRadius: `0px`, transform: `translate3d(0, ${yLeave}%, 0)` }}
                    // config={{ mass: 1, tension: 50, friction: 5 }}
                    >
                        {index => style => (
                            <animated.div className="story-item" style={{ ...style }} >
                                {this.renderStoryItem(index, style)}
                            </animated.div>
                        )}
                    </Transition>

                </div>
            </Swipeable >
        );
    }
}

export default FocusResult;