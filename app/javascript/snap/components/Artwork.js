import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { isIOS, isAndroid, isSafari, isFirefox, isChrome } from 'react-device-detect';

import * as constants from './Constants';
import withOrientation from './withOrientation';
import withTranslation from './withTranslation';
import share from 'images/share.svg';
import posed from "react-pose";

import check_email_icon from 'images/check_email.svg';
import LanguageDropdown from './LanguageDropdown';
import EmailForm from './EmailForm';
import Footer from './Footer';
import About from './About';
import { Popover, PopoverBody } from 'reactstrap';

import close_icon from 'images/cross.svg';
import google_logo from 'images/google_translate.svg';
import { SearchRequestService } from '../services/SearchRequestService';
import ProgressiveImage from 'react-progressive-image';
import { Controller, Scene } from 'react-scrollmagic';
import styled from 'styled-components';
import { flattenDeep, filter, debounce } from 'lodash';
import StoryItem from '../components/StoryItem';
import scan_button from 'images/scan-button.svg';
import { Transition, animated } from 'react-spring/renderprops';
import { Tween, Timeline } from 'react-gsap';
import { isTablet } from 'react-device-detect';


/** 
 * withRouter HOC provides props with location, history and match objects
*/
const SectionWipesStyled = styled.div`
  overflow: hidden;
  .panel {
    height: 100vh;
    width: 100vw;
  }  
`;


/** React pose animation config */
const Child = posed.div({
    enter: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 400,
            ease: "linear"
        }
    },
    exit: {
        y: 50,
        opacity: 0
    }
});

const Container = posed.div({
    enter: {
        opacity: 1,
        staggerChildren: 300
    },
    exit: {
        opacity: 0
    }
});

class Artwork extends Component {


    constructor(props) {
        super(props);
        console.log('Artwork >> constructor');
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
            ...props.location.state,
            sharePopoverIsOpen: false,
            showEmailScreen: false,
            emailCaptured: false,
            emailCaptureAck: false,
            bgLoaded: false,
            alsoInRoomResults: [],
            email: localStorage.getItem(constants.SNAP_USER_EMAIL) || '',
            snapAttempts: localStorage.getItem(constants.SNAP_ATTEMPTS) || 1,
            errors: {
                email: false
            },
            artworkVScrollOffset: 0,
            artworkVScrollDuration: 0
        }


        this.artworkRef = null;

    }


    constructResultAndInRoomSlider = (search_result) => {
        if (search_result["success"]) {
            let result = {};
            let roomRecords = [];
            if (search_result["data"]["records"].length > 0) {

                const w = screen.width;
                const h = (isTablet) ? screen.height : 95;
                const artUrlParams = '?w=' + (w - 120);
                const cropParams = '?q=0&auto=compress&crop=faces,entropy&fit=crop&w=' + w;
                const topCropParams = '?q=0&auto=compress&crop=top&fit=crop&h=' + h + '&w=' + w;
                const lowQualityParams = '?q=0&auto=compress';

                const art_obj = search_result["data"]["records"][0];
                result['id'] = art_obj.id;
                result['title'] = art_obj.title;
                result['shortDescription'] = art_obj.shortDescription;
                result['artist'] = art_obj.people;
                result['nationality'] = art_obj.nationality;
                result['birthDate'] = art_obj.birthDate;
                result['deathDate'] = art_obj.deathDate;
                result['culture'] = art_obj.culture;
                result['classification'] = art_obj.classification;
                result['locations'] = art_obj.locations;
                result['medium'] = art_obj.medium;
                result['url'] = art_obj.art_url + artUrlParams;
                result['url_low_quality'] = art_obj.art_url + lowQualityParams;
                result['bg_url'] = art_obj.art_url + topCropParams;
                result['invno'] = art_obj.invno;
                result['displayDate'] = art_obj.displayDate;
                result['dimensions'] = art_obj.dimensions;
                result['curatorialApproval'] = (art_obj.curatorialApproval === "false") ? false : true;
                result['unIdentified'] = art_obj.people.toLowerCase().includes('unidentified')
            }

            if (search_result["data"]["roomRecords"].length > 0) {
                roomRecords = search_result["data"]["roomRecords"];
            }

            //this.slideOverAnimationThreshold = (roomRecords.length > 0) ? 540 : 0;
            return {
                artwork: result,
                roomRecords: roomRecords
            }
        } else {
            return {
                artwork: {},
                roomRecords: []
            }
        }
    }

    async componentWillMount() {
        console.log('Artwork >> componentWillMount');

        let imageId = (this.state.result) ? this.state.result.data.records[0].id : this.props.match.params.imageId;
        const selectedLang = await this.getSelectedLanguage();
        const { stories, storyId, storyTitle } = await this.setupStory(imageId);
        const emailCaptured = localStorage.getItem(constants.SNAP_USER_EMAIL) !== null;

        if (!this.state.result) {
            const artworkInfo = await this.sr.getArtworkInformation(imageId);
            const { artwork, roomRecords } = this.constructResultAndInRoomSlider(artworkInfo);
            this.setState({
                selectedLanguage: selectedLang[0],
                stories: stories,
                storyId: storyId,
                storyTitle: storyTitle,
                result: artworkInfo,
                showStory: artworkInfo.data.show_story,
                artwork: artwork,
                roomRecords: roomRecords,
                emailCaptured: emailCaptured,
                emailCaptureAck: emailCaptured
            });

        } else {
            const { artwork, roomRecords } = this.constructResultAndInRoomSlider(this.state.result);
            this.setState({
                selectedLanguage: selectedLang[0],
                stories: stories,
                storyId: storyId,
                storyTitle: storyTitle,
                showStory: this.state.result.data.show_story,
                artwork: artwork,
                roomRecords: roomRecords,
                emailCaptured: emailCaptured,
                emailCaptureAck: emailCaptured
            });

        }

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
        console.log('Selected lang changed in Artwork >> : ' + JSON.stringify(lang));
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
        const { stories, storyId, storyTitle } = await this.setupStory(imageId);
        const { artwork, roomRecords } = this.constructResultAndInRoomSlider(artworkInfo);
        this.setState({
            result: artworkInfo,
            selectedLanguage: lang,
            stories: stories,
            storyId: storyId,
            storyTitle: storyTitle,
            artwork: artwork,
            roomRecords: roomRecords
        });
    }

    getFocusedArtworkImageId = () => {
        return (this.state.artwork) ? this.state.artwork.id : this.props.match.params.imageId;
    }

    setupStory = async (imageId) => {
        let stories_data = await this.sr.getStoryItems(imageId);
        if (stories_data.data.total > 0) {
            return { stories: stories_data.data.content.stories, storyId: stories_data.data.unique_identifier, storyTitle: stories_data.data.content.story_title };
        } else {
            return { stories: undefined, storyId: undefined, storyTitle: undefined };
        }
    }

    onBackgroundImageLoad = () => {
        this.setState({ bgLoaded: true });
    }


    onSelectInRoomArt = (aitrId) => {
        localStorage.setItem(constants.SNAP_ATTEMPTS, parseInt(this.state.snapAttempts) + 1);
        this.props.history.push({ pathname: `/artwork/${aitrId}` });
    }

    componentDidMount() {
        console.log('Artwork >> componentDidMount');
        this.scrollInProgress = false;
        // Register scroll listener
        window.addEventListener('scroll', this._onScroll, true);
    }

    componentWillUnmount() {
        // Un-register scroll listener
        window.removeEventListener('scroll', this._onScroll);
    }

    /**
     * All the fancy scroll animation goes here.
     */
    handleScroll = () => {
        if (!this.artworkRef || !this.shortDescContainer) {
            this.scrollInProgress = false;
            return;
        }

        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let resultsContainerBottom = Math.ceil(h - this.artworkRef.getBoundingClientRect().bottom);
        //console.log('resultsContainerBottom :: ' + resultsContainerBottom);


        let shortDescBoundingRect = this.shortDescContainer.getBoundingClientRect();
        let shortDescElemTop = shortDescBoundingRect.y;
        let shortDescElemHeight = shortDescBoundingRect.bottom - shortDescBoundingRect.top;
        let currentShortDescScrollOffset = h - shortDescElemTop;
        let visibleShortDescHeight = Math.floor(currentShortDescScrollOffset);

        this.scrollInProgress = false;
    }

    _onScroll = (event) => {
        if (!this.scrollInProgress) {
            requestAnimationFrame(debounce(this.handleScroll, 20))
            this.scrollInProgress = true;
        }
    }

    getFacebookShareUrl = () => {
        let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.artwork.id;
        return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(urlToShare)
    }

    nativeAppShareWithWebFallback = (e) => {
        const socialMediaType = e.currentTarget.dataset.id
        this.setState({ sharePopoverIsOpen: false });

        let appUriScheme;
        let webFallbackURL;
        let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.artwork.id;

        switch (socialMediaType) {
            case constants.SOCIAL_MEDIA_TWITTER: {

                let hashtag = 'barnesfoundation';

                let title_author = this.state.artwork.title;
                if (this.state.artwork.artist) {
                    title_author += ' by ' + this.state.artwork.artist;
                    hashtag += ',' + this.state.artwork.artist.split(' ').join('').split('-').join('');
                }
                title_author = title_author.split(' ').join('+');
                //urlToShare += '?utm_source=barnes_snap&utm_medium=twitter&utm_term=' + this.state.artwork.id;
                //appUriScheme = 'twitter://post?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;
                webFallbackURL = 'https://twitter.com/intent/tweet?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;

                window.open(webFallbackURL, '_blank');
                break;
            }
        }

        e.preventDefault();
    }

    _onClickShare = () => {

        if (navigator.share) {
            let urlToShare = 'https://collection.barnesfoundation.org/objects/' + this.state.artwork.id;
            let hashtag = '#barnesfoundation';

            let title_author = this.state.artwork.title;
            if (this.state.artwork.artist) {
                title_author += ' by ' + this.state.artwork.artist;
                hashtag += ' #' + this.state.artwork.artist.split(' ').join('');
            }
            title_author = title_author + '. ';

            navigator.share({
                title: 'Barnes Foundation',
                text: title_author + ' ' + hashtag,
                url: urlToShare
            })
                .then(() => {
                    console.log('Successful share');
                })
                .catch((error) => console.log('Error sharing', error));
        } else {
            this.toggleShareModal();
        }

    }

    toggleShareModal = () => {
        this.setState({ sharePopoverIsOpen: !this.state.sharePopoverIsOpen });
    }

    resetExperience = () => {
        localStorage.removeItem(constants.SNAP_LANGUAGE_PREFERENCE);
        localStorage.removeItem(constants.SNAP_USER_EMAIL);
        localStorage.removeItem(constants.SNAP_ATTEMPTS);
        localStorage.removeItem(constants.SNAP_LANGUAGE_TRANSLATION);
    }

    onSubmitEmail = (email) => {
        console.log('Submitted email :: ' + email);
        this.setState({ email: email, emailCaptured: true });
        this.sr.submitBookmarksEmail(email);
        // close the email card after 4 secs
        setTimeout(() => {
            this.setState({ emailCaptureAck: true });
        }, 4000);

    }

    setArtworkRef = (elem) => {
        if (elem) {
            this.artworkRef = elem;
            //console.log('setArtworkRef == ' + this.artworkRef);

            const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            const artworkVScrollOffset = Math.max(Math.ceil(this.artworkRef.getBoundingClientRect().bottom - h), 0);
            const artworkVScrollDuration = Math.ceil(((artworkVScrollOffset + 60) / h) * 100);
            this.setState({ artworkVScrollOffset, artworkVScrollDuration })

        }
    }

    onStoryReadComplete = () => {
        const imageId = this.getFocusedArtworkImageId();
        const storyId = this.state.storyId;
        this.sr.markStoryAsRead(imageId, storyId);
    }

    /**
     * Renders the focused artwork card.
     */
    renderArtwork = () => {
        const { artwork, selectedLanguage } = this.state;
        return (
            <Container className="container-fluid artwork-container" id="search-result" initialPose="exit" pose="enter">
                <div className="row">
                    <div className="artwork-top-bg">
                        <img className="card-img-top" src={artwork.bg_url} alt="match_image_background" />
                    </div>
                    <div className="col-12 col-md-12">
                        <div id="result-card" className="card" data-title={artwork.title} data-artist={artwork.artist} data-id={artwork.id} data-invno={artwork.invno} data-nodesc-invno={(!artwork.shortDescription) ? artwork.invno : ''}>
                            <div className="card-top-container">
                                <div className="card-img-overlay">
                                    <div className="card-header h1">Focused Artwork</div>
                                    <div className="card-img-result">
                                        <ProgressiveImage src={artwork.url} placeholder={artwork.url_low_quality}>
                                            {src => <img src={src} alt="match_image" />}
                                        </ProgressiveImage>
                                        {/* <img src={artwork.url} alt="match_image" /> */}
                                    </div>
                                    <div className="card-artist">{artwork.artist}</div>
                                    <div className="card-title">{artwork.title}</div>
                                </div>
                            </div>
                            <div className="card-body" id="focussed-artwork-body" ref={this.setArtworkRef}>
                                <div className="short-desc-container" ref={elem => this.shortDescContainer = elem}>
                                    {artwork.shortDescription && <div className="card-text paragraph">{artwork.shortDescription}</div>}
                                </div>
                                {
                                    artwork.shortDescription &&
                                    selectedLanguage.code !== constants.LANGUAGE_EN &&
                                    <div className="google-translate-disclaimer"><span>Translated with </span><img src={google_logo} alt="google_logo" /></div>
                                }
                                <div className="card-info">
                                    <table className="detail-table">
                                        <tbody>
                                            <tr>
                                                <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_3')}:</td>
                                                <td className="text-left item-info">{artwork.artist} {(artwork.unIdentified) ? '' : `(${artwork.nationality}, ${artwork.birthDate} - ${artwork.deathDate})`}</td>
                                            </tr>
                                            {
                                                artwork.unIdentified &&
                                                <tr>
                                                    <td className="text-left item-label">Culture:</td>
                                                    <td className="text-left item-info">{artwork.culture}</td>
                                                </tr>
                                            }
                                            <tr>
                                                <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_4')}:</td>
                                                <td className="text-left item-info">{artwork.title}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_5')}:</td>
                                                <td className="text-left item-info">{artwork.displayDate}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_6')}:</td>
                                                <td className="text-left item-info">{artwork.medium}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_7')}:</td>
                                                <td className="text-left item-info">{artwork.dimensions}</td>
                                            </tr>
                                            {
                                                !artwork.curatorialApproval &&
                                                <tr>
                                                    <td className="text-left item-label">{this.props.getTranslation('Result_page', 'text_8')}:</td>
                                                    <td className="text-left item-info">{this.props.getTranslation('Result_page', 'text_9')}</td>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>

                                <div className="share-wrapper">
                                    <div className="language-dropdown-wrapper">
                                        <div className="language-dropdown">
                                            <LanguageDropdown langOptions={this.langOptions} selected={this.state.selectedLanguage} onSelectLanguage={this.onSelectLanguage} />
                                        </div>
                                    </div>
                                    <div id="share-it" className="btn-share-result" ref={(node) => { this.target = node }} onClick={this._onClickShare}>
                                        <img src={share} alt="share" />
                                        <span className="text-share">
                                            {this.props.getTranslation('Result_page', 'text_1')}
                                        </span>
                                    </div>
                                    <Popover placement="top" isOpen={this.state.sharePopoverIsOpen} target="share-it">
                                        <PopoverBody>
                                            <div className="share">
                                                <a data-id={constants.SOCIAL_MEDIA_TWITTER} onClick={this.nativeAppShareWithWebFallback}>
                                                    <i className="fa fa-lg fa-twitter" aria-hidden="true"></i>
                                                </a>
                                                <a target="_blank" href={this.getFacebookShareUrl()} data-id={constants.SOCIAL_MEDIA_FACEBOOK}>
                                                    <i className="fa fa-lg fa-facebook" aria-hidden="true"></i>
                                                </a>
                                            </div>
                                        </PopoverBody>
                                    </Popover>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    /**
     * Renders the email screen. withStory flag determines whether the email screen is displayed along with story parts.
     */
    renderEmailScreen = () => {
        const { showStory, stories, emailCaptureAck } = this.state;
        if (emailCaptureAck) {
            return <div></div>;
        } else {
            return (
                <div className="panel panel-email" >
                    <EmailForm withStory={showStory} isEmailScreen={false} onSubmitEmail={this.onSubmitEmail} getTranslation={this.props.getTranslation} />
                </div>
            );
        }

    };

    /**
     * Renders the story cards if * showStory * flag is true.
     */
    renderStory = () => {
        const { showStory, stories, storyTitle } = this.state;
        if (!showStory) {
            return <div></div>;
        }
        return (
            stories.map((story, index) =>
                <Scene indicators pin key={`storyitem${index + 1}`} triggerHook="onLeave" pinSettings={{ pushFollowers: true }} duration={300} offset="300">
                    {(progress, event) => (

                        <div id={`story-card-${index}`} className={`panel panel${index + 1}`}>
                            <StoryItem
                                progress={progress}
                                sceneStatus={event.type}
                                storyIndex={index}
                                story={story}
                                storyTitle={storyTitle}
                                langOptions={this.langOptions}
                                selectedLanguage={this.state.selectedLanguage}
                                onSelectLanguage={this.onSelectLanguage}
                                onStoryReadComplete={this.onStoryReadComplete} />
                        </div>
                    )}
                </Scene>
            )
        );
    }

    /**
     * Renders the story cards if * showStory * flag is true.
     */
    renderTriggers = () => {
        const { showStory, stories, storyTitle } = this.state;
        if (!showStory) {
            return <div></div>;
        }
        return (
            stories.map((story, index) =>
                
                <Scene key={`storytrigger${index + 1}`} pin={`#story-card-${index}`} triggerElement={`#story-card-${index}`} triggerHook="onEnter" indicators={true} duration="300" offset="100" pinSettings={{ pushFollowers: false }}>
                    <div>test</div>
                </Scene> 
            )
        );
    }



    /**
     * Main render screen setup
     */
    renderResult = () => {
        const { stories, showStory, artworkVScrollOffset, artworkVScrollDuration } = this.state;
        //console.log('artworkVScrollOffset ====== ' + artworkVScrollOffset);
        //console.log('artworkVScrollDuration ====== ' + artworkVScrollDuration);
        return (
            <SectionWipesStyled>
                <Controller >
                    <Scene duration="100%" indicators pin triggerHook="onLeave" pinSettings={{ pushFollowers: true }}>
                        {(progress) => (
                            <div className="panel">
                                <Tween
                                    from={{ y: '-0%' }}
                                    to={{ y: "-0%" }}
                                    progress={progress}
                                    paused
                                >
                                    {this.renderArtwork()}
                                </Tween>

                            </div>
                        )}
                    </Scene>

                    {this.renderStory()}

                    {this.renderTriggers()}

                    <Scene indicators pin pinSettings={{ pushFollowers: true }} duration="800">
                        {this.renderEmailScreen()}
                    </Scene>


                </Controller>

            </SectionWipesStyled >

        );
    }

    render() {

        if (!this.state.artwork) {
            return null;
        }
        return (
            <div>
                {!this.state.bgLoaded &&
                    <div style={{ visibility: `hidden` }}>
                        <img className="card-img-top" src={this.state.artwork.bg_url} alt="match_image_background" onLoad={this.onBackgroundImageLoad} />
                    </div>
                }
                {this.state.bgLoaded && this.renderResult()}
            </div>
        );
    }
}

export default compose(
    withOrientation,
    withTranslation,
    withRouter
)(Artwork);