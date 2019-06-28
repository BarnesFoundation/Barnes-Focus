import React from 'react';
import { animated, config } from 'react-spring/renderprops';
import LanguageDropdown from '../components/LanguageDropdown';
import { throws } from 'assert';
import { Tween, Timeline } from 'react-gsap';

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
            storyRead: false
        }
    }

    componentDidMount() {
        console.log('StoryItem >> componentDidMount');
        this.scrollInProgress = false;
        // Register scroll listener
        this.cardRef.current.addEventListener('scroll', this._onScroll, true);
    }

    componentWillUnmount() {
        // Un-register scroll listener
        this.cardRef.current.removeEventListener('scroll', this._onScroll);
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.sceneStatus)
        if (nextProps.sceneStatus === 'start' && nextProps.storyIndex === 2) {
            if (!this.state.storyRead) {
                this.setState({ storyRead: true });
                this.props.onStoryReadComplete();
            }
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

    render() {
        const { story, progress } = this.props;
        console.log('StoryItem >> render', progress);
        return (
            <div className="card story-item" ref={this.cardRef}>
                {
                    (this.props.storyIndex === 0) &&
                    <div className="story-item-nav">
                        <div className="col-8 story-nav-question">Why so many Renoirs?</div>
                        <div className="col-4 language-dropdown">
                            <LanguageDropdown isStoryItemDropDown={true} langOptions={this.props.langOptions} selected={this.props.selectedLanguage} onSelectLanguage={this.props.onSelectLanguage} />
                        </div>
                    </div>
                }
                <Timeline
                    totalProgress={progress * 5}
                    paused
                    >
                    <Tween from={{ filter: "blur(8px)" }} to={{ filter: "blur(0px)" }} duration={0.8} >
                        <img className="card-img-top" src={this.getArtUrl()} alt="story_item" style={{ width: `100%` }} />
                    </Tween>
                
                    <Timeline
                        target={
                            <div className="card-img-overlay">
                                <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                                <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                                <p className="story-footer">{story.detail.title}, {story.detail.displayDate}<br /> {story.detail.people}</p>
                            </div>
                    }>
                    <Tween from={{ autoAlpha: 0, y: '50px' }} to={{ autoAlpha: 1, y: '0px' }} duration={0.8} />
                    </Timeline>

                </Timeline>

            </div>

        );
    }
}

export default StoryItem;