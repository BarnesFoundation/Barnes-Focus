import React from 'react';
import { animated, config } from 'react-spring/renderprops';
import LanguageDropdown from '../components/LanguageDropdown';
import { throws } from 'assert';
import { Tween, Timeline } from 'react-gsap';
import { TweenMax, TimelineLite, Power2, Linear, Elastic, CSSPlugin } from "gsap/TweenMax";
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
        this.contentRef = React.createRef();

        

        this.state = {
            storyRead: false,
            heightUpdated: false,
            scrollHeight: 0,
            showTitle: true
        }
    }

    componentDidMount() {
        console.log('StoryItem >> componentDidMount', this.contentRef.clientHeight);
        this.scrollInProgress = false;
        this.setState({scrollHeight: this.contentRef.clientHeight})
        // Register scroll listener
        // this.cardRef.current.addEventListener('scroll', this._onScroll, true);
        
        // this.tween;
        
        // const tween = this.tween.getGSAP();
        // tween.timeScale(0.1);
        
        this.t2 = new TimelineLite({paused: true});

    }

    componentWillUnmount() {
        // Un-register scroll listener
        // this.cardRef.current.removeEventListener('scroll', this._onScroll);
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps.sceneStatus)
        if (nextProps.sceneStatus.type === 'start' && nextProps.storyIndex === 2) {
            if (!this.state.storyRead) {
                this.setState({ storyRead: true });
                this.props.onStoryReadComplete();
            }
        }
        if (nextProps.sceneStatus.type === 'start' && nextProps.storyIndex === 0) {
            // console.log("First Card Started", nextProps.sceneStatus.type, this.props.sceneStatus.type)
            let showTitle = (nextProps.sceneStatus.type === 'start' && nextProps.sceneStatus.state === 'DURING');
            if((this.props.sceneStatus.state != nextProps.sceneStatus.state) || this.props.sceneStatus.type === 'enter') {
                this.props.statusCallback(showTitle);
                this.setState({showTitle: !showTitle});
            }
        }
        // console.log("STORY HEIGHT:", this.cardRef.current.getBoundingClientRect().height);
    }

    componentDidUpdate() {
        // console.log("Story ComponentDidUpdate", this.contentRef.getBoundingClientRect().top, this.state.scrollOffset*this.props.progress);
        console.log("Did Update Scene Status", this.props.sceneStatus)
        if(!this.state.heightUpdated) {
            var contentHeight = this.contentRef.getBoundingClientRect().height;
            let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var offset;
            offset = (contentHeight > h) ? contentHeight - h + 100 : 50;
            if(offset < 0) offset = 0;
            // console.log("SCROLL OFFSET", offset);
            
            // if(this.state.scrollOffset < offset) {
                this.props.getSize(offset, this.props.storyIndex);
                this.setState({scrollOffset: offset})
            // }
            this.setState({heightUpdated: true})
            
            console.log("Setting TWEEN OFFSET", offset, contentHeight, h);

            this.t2
                .fromTo(this.contentRef, 0.1, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' })
                .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, "-=0.1")
        }
        
        if(this.t2) this.t2.progress(this.props.progress);
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
        // console.log("Ref card callback", element);
        if(element) {
            this.cardRef = element;
            //this.props.getSize(element.getBoundingClientRect().height, this.props.key);
        }
    }

    refContentCallback = (element) => {
        // console.log("Ref content callback", element);
        if(element) {
            this.contentRef = element;
            // this.props.getSize(element.getBoundingClientRect().height, this.props.key);
        }
    }

    render() {
        const { story, storyTitle, progress } = this.props;
        // console.log('StoryItem >> render', this.props.storyIndex, progress);
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
                    (this.props.storyIndex === 0 && this.state.showTitle) &&
                    <div className="story-title-bar">
                        <div className="col-8 story-title">{storyTitle}</div>
                        <div className="col-4 language-dropdown">
                            <LanguageDropdown isStoryItemDropDown={true} langOptions={this.props.langOptions} selected={this.props.selectedLanguage} onSelectLanguage={this.props.onSelectLanguage} />
                        </div>
                    </div>
                }
                    <Timeline
                        totalProgress={progress*3}
                        paused
                        target={
                            <img className="card-img-top" src={this.getArtUrl()} alt="story_item" style={{ width: `100%` }} />
                        }>
                        {/*<Tween from={{ css:{borderRadius: "50px 50px 0px 0px", filter: "blur(0px)", transform: "scale(1.0)"} }} to={{ css:{borderRadius: "0px 0px 0px 0px", filter: "blur(10px)", transform: "scale(1.0)"} }} ease="easeOut" duration={0.2} />*/}
                    </Timeline>

                    <div className="content-mask">

                        <div className="card-img-overlay" ref={this.refContentCallback}>
                            <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                            <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                            <p className="story-footer">{story.detail.title}, {story.detail.displayDate}<br /> {story.detail.people}</p>
                            {
                                this.props.selectedLanguage.code !== LANGUAGE_EN &&
                                <div className="google-translate-disclaimer"><span>Translated with </span><img src={google_logo} alt="google_logo" /></div>
                            }
                        </div>

                    </div>

                    {/*<div className="card-img-overlay" ref={this.refContentCallback}>
                        <Timeline
                            totalProgress={progress*1.5}
                            paused
                            target={
                                <div>
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
                            <Tween from={{ y: '0px' }} to={{ y: `-${this.state.scrollHeight}` }} duration={0.8}  /> 
                        </Timeline>
                    </div>*/}
            </div>
            </Timeline>
            </div>
            </Tween>
        );
    }
}

export default StoryItem;