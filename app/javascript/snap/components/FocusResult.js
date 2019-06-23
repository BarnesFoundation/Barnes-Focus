import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

import { SearchRequestService } from '../services/SearchRequestService';
import scan_button from 'images/scan-button.svg';

import Artwork from '../components/Artwork';
import StoryItem from '../components/StoryItem';

import { Transition, animated } from 'react-spring/renderprops';
import { Swipeable } from 'react-swipeable';
import * as constants from './Constants';
import { flattenDeep, filter } from 'lodash';
import { Controller, Scene } from 'react-scrollmagic';
import styled from 'styled-components';
import { Timeline, Tween } from 'react-gsap';
import Sticky from 'react-sticky-el';



/** 
 * withRouter HOC provides props with location, history and match objects
*/
const swipeableConfig = {
    delta: 10
};

const SectionWipesStyled = styled.div`
  overflow: hidden;

  .panel {
    height: 100vh;
    width: 100vw;
  }
  
`;

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
            stories: [],
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
        const selectedLang = await this.getSelectedLanguage();
        const stories = await this.setupStory(imageId);

        if (!this.state.result) {
            const artworkInfo = await this.sr.getArtworkInformation(imageId);
            this.setState({ selectedLanguage: selectedLang[0], stories: stories, result: artworkInfo, showStory: artworkInfo.show_story });
        } else {
            this.setState(
                { selectedLanguage: selectedLang[0], stories: stories, showStory: this.state.result.data.show_story }
            );
        }


    }

    componentDidMount() {
        console.log('FocusResult >> componentDidMount');

        console.log('height of story card 0 = ' + document.getElementById('story-card-0'));
        console.log('height of story card 1 = ' + document.getElementById('story-card-1'));
    }

    getSelectedLanguage = async () => {
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
        return filter(this.langOptions, lang => lang.selected === true);
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
        let stories_data = await this.sr.getStoryItems(imageId);

        // if (stories_data.data.total > 0) {
        //     return stories_data.data.content.stories;
        // } else {
        //     return [];
        // }

        return [
            {
                "image_id": "5198",
                "short_paragraph": {
                    "html": "Between 1912 and 1951,Albert C.Barnes amassed an astonishing 181 works by Pierre - Auguste Renoir.It is the largest collection in the world."
                },
                "long_paragraph": {
                    "html": "Albert Barnes bought his first painting by Renoir in 1912. He was immediately hooked.“I am convinced that I cannot get too many Renoirs, he announced to his friend,Leo Stein.By the time of his death in 1951,Barnes amassed an astounding 181 works by the artist— the largest is his joy in painting the real life of red - blooded people.”He bought this Mother and Child in 1920."
                },
                "detail": {
                    "id": 5198,
                    "art_url": "https://barnes-images.imgix.net/5198_65Hrs55ZBnJWPjr1_b.jpg",
                    "room": "Room 13",
                    "invno": "BF15",
                    "title": "Young Mother (Jeune mère)",
                    "medium": "Oil on canvas",
                    "people": "Pierre-Auguste Renoir",
                    "locations": "Barnes Foundation (Philadelphia), Collection Gallery, Room 13, North Wall",
                    "creditLine": "",
                    "dimensions": "Overall: 47 3/4 x 33 3/4 in. (121.3 x 85.7 cm)",
                    "displayDate": "1881",
                    "imageSecret": "65Hrs55ZBnJWPjr1",
                    "ensembleIndex": "49",
                    "classification": "Paintings",
                    "shortDescription": "Renoir painted this scene of a peasant girl holding a child during a trip to Naples in 1881. Dissatisfied with his drawing skills, he had travelled to Italy to study the ancient frescoes and Italian Renaissance masters; the paintings of Raphael in particular had a simplicity and grandeur� that Renoir sought to achieve in his own work.One can see the Italian painter 's influence here, in the balanced arrangement of the rosy-cheeked figures and the gentle interaction between them. It is almost as if Renoir has created a modern, secular take on the Madonna and Child subject.",
                    "curatorialApproval": "true"
                }
            },
            {
                "image_id": "5183",
                "short_paragraph": {
                    "html": "Renoir is best known for his impressionist paintings made during the 1870 s.Barnes vastly preferred Renoir’ s later canvases,however,because they seemed modern and classical at the same time.This 1910 nude is a good example."
                },
                "long_paragraph": {
                    "html": "While other collectors favored Renoir’ s impressionist paintings(exemplified by the landscape just to the right),Barnes preferred the artist’ s later canvases made between 1890 and his death in 1919. In this period, Renoir concentrated on more traditional subjects like bathers set in dreamy landscapes, perfectly centered, with soft,curvy bodies.To many critics,it seemed that Renoir had passed his prime.Barnes disagreed.He saw the late works as the perfect blend of classical and modern vocabularies and called them the“ summation of Renoir’ s powers.”The late works make up 85 % of Barnes’ s Renoir collection."
                },
                "detail": {
                    "id": 5183,
                    "art_url": "https://barnes-images.imgix.net/5183_UGuBgiKQmnioAztv_b.jpg",
                    "room": "Room 13",
                    "invno": "BF142",
                    "title": "After the Bath (La Sortie du bain)",
                    "medium": "Oil on canvas",
                    "people": "Pierre-Auguste Renoir",
                    "locations": "Barnes Foundation (Philadelphia), Collection Gallery, Room 13, West Wall",
                    "creditLine": "",
                    "dimensions": "Overall: 37 3/16 x 29 5/8 in. (94.5 x 75.2 cm)",
                    "displayDate": "1910",
                    "imageSecret": "UGuBgiKQmnioAztv",
                    "ensembleIndex": "52",
                    "classification": "Paintings",
                    "shortDescription": "",
                    "curatorialApproval": "true"
                }
            },
            {
                "image_id": "5187",
                "long_paragraph": {
                    "html": "Barnes purchased over half of his Renoirs from Paul Durand - Ruel,the famous impressionist dealer.Durand - Ruel had galleries in Paris and New York, and Barnes visited both locations regularly to see exhibitions and check out the new stock.“It is my intention to make my Renoir collection the best in the world,”he told the dealer.This painting of Paul Durand - Ruel’ s daughter,Jeanne,was part of the Durand - Ruel private collection.It stayed in the family for many years.Barnes purchased it from the dealer’ s youngest daughter, Marie - Therese, in 1935."
                },
                "detail": {
                    "id": 5187,
                    "art_url": "https://barnes-images.imgix.net/5187_cJ1n0YDmWauW39XF_b.jpg",
                    "room": "Room 13",
                    "invno": "BF950",
                    "title": "Portrait of Jeanne Durand-Ruel (Portrait de Mlle. J.)",
                    "medium": "Oil on canvas",
                    "people": "Pierre-Auguste Renoir",
                    "locations": "Barnes Foundation (Philadelphia), Collection Gallery, Room 13, West Wall",
                    "creditLine": "",
                    "dimensions": "Overall: 44 7/8 x 29 1/8 in. (114 x 74 cm)",
                    "displayDate": "1876",
                    "imageSecret": "cJ1n0YDmWauW39XF",
                    "ensembleIndex": "52",
                    "classification": "Paintings",
                    "shortDescription": "During the early decades of his career, Pierre-Auguste Renoir supported himself doing portrait commissions. This little girl is the daughter of Paul Durand-Ruel, the great impressionist dealer from whom Albert Barnes bought almost half his Renoirs. Jeanne is presented here at age six, wearing a fashionable striped dress and a gold cross around her neck. The painting is a good example of the way Renoir seemed to embrace the traditions of painting while also pushing against them: the colors are experimental and modern--note the sweeps of purple in the girl's hair--while the overall format recalls the conventions of seventeenth-century court portraiture. ",
                    "curatorialApproval": "true"
                }
            },
            {
                "image_id": "5186",
                "long_paragraph": {
                    "html": " Renoir died in 1919, leaving behind more than 700 canvases in his Cagnes - sur - Mer studio.Eager for a glimpse, Barnes travelled there in 1921— a visit he later described as“ one of the most delightful experiences I ever had.”He would eventually buy 41 studio paintings from the Renoir sons."
                },
                "detail": {
                    "id": 5186,
                    "art_url": "https://barnes-images.imgix.net/5186_b6I3JBwYhzyyRqa7_b.jpg",
                    "room": "Room 13",
                    "invno": "BF1136",
                    "title": "Odalisque with Tea Set (Odalisque à la théière)",
                    "medium": "Oil on canvas",
                    "people": "Pierre-Auguste Renoir",
                    "locations": "Barnes Foundation (Philadelphia), Collection Gallery, Room 13, West Wall",
                    "creditLine": "",
                    "dimensions": "Overall: 16 5/16 x 12 11/16 in. (41.5 x 32.3 cm)",
                    "displayDate": "c. 1917–1919",
                    "imageSecret": "b6I3JBwYhzyyRqa7",
                    "ensembleIndex": "52",
                    "classification": "Paintings",
                    "shortDescription": "",
                    "curatorialApproval": "true"
                }
            }
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
        const { index, prevIndex, scrollDir, result, stories, showStory } = this.state;
        const showEmailCard = !showStory;
        console.log(stories);
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

            <SectionWipesStyled>
                {/* <div className="panel panel0"> */}
                <Artwork result={result} langOptions={this.langOptions} selectedLanguage={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} />
                {/* </div> */}
                <Controller globalSceneOptions={{ triggerHook: 'onLeave' }}>
                    {
                        stories.map((story, index) =>
                            <Scene indicators pin key={`storyitem${index + 1}`}>

                                <div id={`story-card-${index}`} className={`panel panel${index + 1}`} style={{ zIndex: 100 * `${index + 2}` }}>
                                    <StoryItem isFirstItem={(index === 0) ? true : false} story={story} langOptions={this.langOptions} selectedLanguage={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} />
                                </div>

                            </Scene>
                        )
                    }
                </Controller>
                <div className="scan-wrapper">
                    <div className="scan-button" onClick={this.handleScan}>
                        <img src={scan_button} alt="scan" />
                    </div>
                </div>
            </SectionWipesStyled>


        );
    }
}

export default FocusResult;
