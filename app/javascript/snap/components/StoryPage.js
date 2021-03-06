import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Controller, Scene } from 'react-scrollmagic';
import { compose } from 'redux';
import styled from 'styled-components';
import queryString from 'query-string';
import StoryItem from '../components/StoryItem';
import { SearchRequestService } from '../services/SearchRequestService';
import * as constants from './Constants';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

const SectionWipesStyled = styled.div`
  overflow: hidden;
  .panel {
    height: auto;
    min-height: 800px;
    width: 100vw;
  }

  .story-item {
    transform: translate3d(0px, 0px, 0px);
  }

  .content-mask {
    mask-image: none;
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
    };
  }

  async componentWillMount() {
    const slug = this.props.match.params.slug;
    const queryParams = queryString.parse(this.props.location.search);

    const { stories, storyId, storyTitle } = await this.setupStory(slug, queryParams.lang);
    const selectedLang = await this.getSelectedLanguage();
    this.setState({
      stories: stories,
      storyId: storyId,
      storyTitle: storyTitle,
      selectedLanguage: selectedLang[0]
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
      });
    }
    return this.langOptions.filter(lang => lang.selected === true);
  };

  setupStory = async (slug, lang) => {
    console.log('fetching stories for slug: ', slug, lang);
    const stories_data = await this.sr.getStoriesFromEmail(slug, lang);
    if (stories_data.data.total > 0) {
      return {
        stories: stories_data.data.content.stories,
        storyId: stories_data.data.unique_identifier,
        storyTitle: stories_data.data.content.story_title
      };
    } else {
      return { stories: [], storyId: undefined, storyTitle: undefined };
    }
  };

  onStoryHeightReady = (height, index) => {
    console.log('Story height ready', height, index);
  };

  onStoryReadComplete = () => {
    console.log('Story read complete!');
  };

  onSelectLanguage = async lang => {
    console.log('Selected lang changed in StoryPage >> : ' + JSON.stringify(lang));
  };

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { stories, storyTitle } = this.state;
    return (
      <SectionWipesStyled>
        <Controller>
          {stories.map((story, index) => (
            <Scene
              indicators={false}
              key={`storyitem${index + 1}`}
              triggerHook="onLeave"
              pin
              pinSettings={{ pushFollowers: false }}
              duration={`1000`}
              offset={0}>
              {(progress, event) => (
                <div id={`story-card-${index}`} className={`story-page panel panel${index + 1}`}>
                  <StoryItem
                    key={`storyitem${index + 1}`}
                    progress={progress}
                    sceneStatus={event.type}
                    storyIndex={index}
                    isLastStoryItem={index === stories.length - 1 ? true : false}
                    story={story}
                    storyTitle={storyTitle}
                    langOptions={undefined}
                    selectedLanguage={this.state.selectedLanguage}
                    onStoryReadComplete={this.onStoryReadComplete}
                    getSize={this.onStoryHeightReady}
                    getTranslation={this.props.getTranslation}
                    storyEmailPage={true}
                  />
                </div>
              )}
            </Scene>
          ))}
          <Scene
            loglevel={0}
            key={`story-page-end`}
            triggerHook="onEnter"
            indicators={false}
            duration={1000}
            offset="0">
            <div id={`story-card-end`} className={`story-page panel`} />
          </Scene>
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
