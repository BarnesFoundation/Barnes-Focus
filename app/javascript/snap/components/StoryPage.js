import React, { Component } from 'react';
import StoryItem from '../components/StoryItem';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';
import { SearchRequestService } from '../services/SearchRequestService';
import { Controller, Scene } from 'react-scrollmagic';
import { Tween, Timeline } from 'react-gsap';
import * as constants from './Constants';
import { filter, debounce } from 'lodash';
import styled from 'styled-components';
import barnes_logo from 'images/barnes_email_logo_1x.png';

const SectionWipesStyled = styled.div`
  overflow: hidden;
  .panel {
    height: auto;
    min-height: 800px;
    width: 100vw;
  }  
`;

class StoryPage extends Component {

    constructor(props) {
        super(props);

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
            stories: []
        }

    }

    async componentWillMount() {
        const slug = this.props.match.params.slug;
        const { stories, storyId, storyTitle } = await this.setupStory(slug);
        const selectedLang = await this.getSelectedLanguage();
        this.setState({
            stories: stories,
            storyId: storyId,
            storyTitle: storyTitle,
            selectedLanguage: selectedLang[0],
        });
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

    setupStory = async (slug) => {
        console.log('fetching stories for slug == ' + slug);
        const stories_data = await this.sr.getStoriesFromEmail(slug);
        if (stories_data.data.total > 0) {
            return { stories: stories_data.data.content.stories, storyId: stories_data.data.unique_identifier, storyTitle: stories_data.data.content.story_title };
        } else {
            return { stories: undefined, storyId: undefined, storyTitle: undefined };
        }
    }

    onStoryHeightReady = (height, index) => {
        console.log("Story height ready", height, index);
    }

    onStoryReadComplete = () => {
        console.log('Story read complete!');
    }

    onSelectLanguage = async (lang) => {
        console.log('Selected lang changed in StoryPage >> : ' + JSON.stringify(lang));
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }


    render() {

        const { stories, storyTitle } = this.state;
        return (
            <SectionWipesStyled>
                <Controller >
                    <div className="story-page-intro">
                        <div className="card-img-overlay">
                            <div className="barnes-logo">
                                <img src={barnes_logo} alt="barnes_logo" />
                            </div>
                            <div className="story-title">
                                {storyTitle}
                            </div>
                        </div>
                    </div>
                    {stories.map((story, index) =>
                        <Scene indicators={true} key={`storyitem${index + 1}`} triggerHook="onLeave" pin pinSettings={{ pushFollowers: false }} duration={`1000`} offset={0}>
                            {(progress, event) => (

                                <div id={`story-card-${index}`} className={`panel panel${index + 1}`}>
                                    <Tween
                                        from={{ y: '-0%' }}
                                        to={{ y: "-0%" }}
                                        progress={progress}
                                        paused
                                    >
                                        <StoryItem
                                            key={`storyitem${index + 1}`}
                                            progress={progress}
                                            sceneStatus={event.type}
                                            storyIndex={index}
                                            story={story}
                                            storyTitle={storyTitle}
                                            langOptions={undefined}
                                            selectedLanguage={this.state.selectedLanguage}
                                            onStoryReadComplete={this.onStoryReadComplete}
                                            getSize={this.onStoryHeightReady} />
                                    </Tween>
                                </div>

                            )}
                        </Scene>
                    )}
                </Controller>
            </SectionWipesStyled>

        );
    }
}

export default compose(
    withOrientation,
    withTranslation,
    withRouter
)(StoryPage);

