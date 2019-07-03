import React from 'react';
import { animated, config } from 'react-spring/renderprops';
import LanguageDropdown from '../components/LanguageDropdown';
import { throws } from 'assert';
import { Tween, Timeline } from 'react-gsap';
import google_logo from 'images/google_translate.svg';
import { LANGUAGE_EN } from './Constants';

const tweenProps = {
    ease: 'Linear.easeNone',
    from: {
        opacity: 0,
        yPercent: 100,
    },
    to: {
        opacity: 1,
        yPercent: 0,
    }
};

class StoryItem extends React.Component {

    constructor(props) {
        super(props);
        this.cardRef = React.createRef();

        this.state = {
            storyRead: false,
            heightUpdated: false
        }
    }

    componentDidMount() {
        console.log('StoryItem >> componentDidMount');
        this.scrollInProgress = false;
        // Register scroll listener
        // this.cardRef.current.addEventListener('scroll', this._onScroll, true);
    }

    componentWillUnmount() {
        // Un-register scroll listener
        // this.cardRef.current.removeEventListener('scroll', this._onScroll);
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.sceneStatus)
        if (nextProps.sceneStatus === 'start' && nextProps.storyIndex === 2) {
            if (!this.state.storyRead) {
                this.setState({ storyRead: true });
                this.props.onStoryReadComplete();
            }
        }
        // console.log("STORY HEIGHT:", this.cardRef.current.getBoundingClientRect().height);
    }

    componentDidUpdate() {
        // console.log("Story ComponentDidUpdate", this.props.storyIndex, this.state.heightUpdated, this.cardRef.getBoundingClientRect());
        if(!this.state.heightUpdated) {
            this.props.getSize(this.cardRef.getBoundingClientRect().height, this.props.storyIndex);
            this.setState({heightUpdated: true})
        }
    }

    getArtUrl = () => {
        return this.props.story.detail.art_url + `?crop=faces,entropy&fit=crop&w=` + screen.width + `&h=` + screen.height;
    }

    /**
     * All the fancy scroll animation goes here.
     */
    handleScroll = () => {
        if (!this.cardRef) {
            this.scrollInProgress = false;
            return;
        }
        console.log('Scrolling on storyItem');
        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let cardBottom = Math.ceil(h - this.cardRef.current.getBoundingClientRect().bottom);

        this.scrollInProgress = false;
    }

    _onScroll = (event) => {
        if (!this.scrollInProgress) {
            requestAnimationFrame(this.handleScroll)
            this.scrollInProgress = true;
        }
    }

    handleUpdate = (event) => {

    }

    refCallback = (element) => {
        if(element) {
            this.cardRef = element;
            this.props.getSize(element.getBoundingClientRect().height, this.props.key);
        }
    }

    getHeight = () => {
        return this.cardRef.current.getBoundingClientRect().height;
    }

    render() {
        const { story, storyTitle, progress } = this.props;
        console.log('StoryItem >> render', this.props.storyIndex, progress);
        return (
            <Tween
                from={{ y: '0px' }}
                to={{ y: "-0%" }} // view height - content height
                progress={progress}
                paused
            >
            <div>
            <Timeline
                totalProgress={progress}
                paused
            >
            <div className="card story-item" ref={this.refCallback}>
                {
                    (this.props.storyIndex === 0) &&
                    <div className="story-title-bar">
                        <div className="col-8 story-title">{storyTitle}</div>
                        <div className="col-4 language-dropdown">
                            <LanguageDropdown isStoryItemDropDown={true} langOptions={this.props.langOptions} selected={this.props.selectedLanguage} onSelectLanguage={this.props.onSelectLanguage} />
                        </div>
                    </div>
                }
                    <Timeline
                        totalProgress={progress*2}
                        paused
                        target={
                            <img className="card-img-top" src={this.getArtUrl()} alt="story_item" style={{ width: `100%` }} />
                        }>
                        <Tween from={{ css:{borderRadius: "50px 50px 0px 0px", filter: "blur(0px)"} }} to={{ css:{borderRadius: "0px 0px 0px 0px", filter: "blur(8px)"} }} duration={0.8} />
                    </Timeline>

                    <Timeline
                        totalProgress={progress*3}
                        paused
                        target={
                            <div className="card-img-overlay">
                                <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                                <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                                <p className="story-footer">{story.detail.title}, {story.detail.displayDate}<br /> {story.detail.people}</p>
                                {
                                    this.props.selectedLanguage.code !== LANGUAGE_EN &&
                                    <div className="google-translate-disclaimer"><span>Translated with </span><img src={google_logo} alt="google_logo" /></div>
                                }
                            </div>
                        }>
                        <Tween from={{ autoAlpha: 0, y: '50px' }} to={{ autoAlpha: 1, y: '0px' }} duration={0.3} />
                    </Timeline>

                

            </div>
            </Timeline>
            </div>
            </Tween>
        );
    }
}

export default StoryItem;