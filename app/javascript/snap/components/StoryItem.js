import React from 'react';
import { animated, config } from 'react-spring/renderprops';
import LanguageDropdown from '../components/LanguageDropdown';
import { throws } from 'assert';
import { Tween, Timeline } from 'react-gsap';
import { TweenMax, TimelineLite, Power2, Linear, Elastic, CSSPlugin } from "gsap/TweenMax";
import google_logo from 'images/google_translate.svg';
import { LANGUAGE_EN } from './Constants';
import barnes_logo from 'images/barnes_email_logo_1x.png';
import scroll_up from 'images/up_wht_1x.png';

class StoryItem extends React.Component {


    constructor(props) {
        super(props);
        this.contentRef = React.createRef();
        this.titleRef = React.createRef();
        this.overlayRef = React.createRef();
        this.scrollCtaRef = React.createRef();

        this.state = {
            storyRead: false,
            heightUpdated: false,
            scrollHeight: 0,
            showTitle: true
        }
    }

    componentDidMount() {
        console.log('StoryItem >> componentDidMount');
        this.scrollInProgress = false;
        this.setState({ scrollHeight: this.contentRef.clientHeight })
        this.t2 = new TimelineLite({ paused: true });
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
            if ((this.props.sceneStatus.state != nextProps.sceneStatus.state) || this.props.sceneStatus.type === 'enter') {
                this.props.statusCallback(showTitle);
                this.setState({ showTitle: !showTitle });
            }
        }

    }

    componentDidUpdate() {
        console.log("StoryItem >> ComponentDidUpdate");
        // console.log("Did Update Scene Status", this.props.sceneStatus)
        if (!this.state.heightUpdated) {
            var contentHeight = this.contentRef.getBoundingClientRect().height;
            let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var offset;
            offset = (contentHeight > h) ? contentHeight - h + 100 : 50;
            if (offset < 0) offset = 0;
            // console.log("SCROLL OFFSET", offset);

            // if(this.state.scrollOffset < offset) {
            this.props.getSize(offset, this.props.storyIndex);
            this.setState({ scrollOffset: offset })
            // }
            this.setState({ heightUpdated: true })

            // console.log("Setting TWEEN OFFSET", offset, contentHeight, h);
            if (this.props.storyIndex === 0) {
                if(this.props.storyEmailPage) {
                    this.t2
                    .fromTo(this.overlayRef, 1, { autoAlpha: 0.5, borderRadius: "50px 50px 0px 0px" }, { autoAlpha: 0, borderRadius: "0px 0px 0px 0px" })
                    .fromTo(this.titleRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
                    .fromTo(this.scrollCtaRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
                    .fromTo(this.contentRef, 0.1, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' }, "-=0.1")
                    .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, "-=0.1")
                } else {
                    this.t2
                    .fromTo(this.overlayRef, 1, { autoAlpha: 0.5, borderRadius: "50px 50px 0px 0px" }, { autoAlpha: 0, borderRadius: "0px 0px 0px 0px" })
                    .fromTo(this.titleRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
                    .fromTo(this.contentRef, 0.1, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' }, "-=0.1")
                    .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, "-=0.1")
                }
                
            } else {
                this.t2
                    .fromTo(this.contentRef, 0.1, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' }, "-=0.1")
                    .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, "-=0.1")
            }


        }

        if (this.t2) this.t2.progress(this.props.progress * 5);

    }

    getArtUrl = () => {
        return this.props.story.detail.art_url + `?crop=faces,entropy&fit=crop&w=` + screen.width + `&h=` + screen.height;
    }

    refContentCallback = (element) => {
        if (element) {
            this.contentRef = element;
            // this.props.getSize(element.getBoundingClientRect().height, this.props.key);
        }
    }

    refTitleCallback = (element) => {
        if (element) {
            this.titleRef = element;
        }
    }

    refOverlayCallback = (element) => {
        if (element) {
            this.overlayRef = element;
        }
    }

    refScrollTextCallback = (element) => {
        if (element) {
            this.scrollCtaRef = element;
        }
    }

    render() {
        const { story, storyTitle, progress } = this.props;
        // console.log('StoryItem >> render', this.props.storyIndex, progress);
        return (
            <div>
                <Timeline
                    totalProgress={progress}
                    paused
                >
                    <div className="card story-item" >
                        {
                            (this.props.storyIndex === 0
                                && this.state.showTitle
                                && !this.props.storyEmailPage) &&
                            <div className="story-title-bar">
                                <div className="story-title">{this.props.getTranslation('Result_page', 'text_11')}</div>
                            </div>
                        }
                        <Timeline
                            totalProgress={progress * 5}
                            paused
                            target={
                                <img className="card-img-top" src={this.getArtUrl()} alt="story_item" style={{ width: `100%` }} />
                            }>
                            {<Tween from={{ css: { borderRadius: "50px 50px 0px 0px" } }} to={{ css: { borderRadius: "0px 0px 0px 0px" } }} ease="easeOut" duration={0.2} />}
                        </Timeline>

                        <Timeline
                            totalProgress={progress * 5}
                            paused
                            target={
                                <div className="overlay"></div>
                            }>
                            <Tween from={{ autoAlpha: 0, borderRadius: "50px 50px 0px 0px" }} to={{ autoAlpha: 0.6, borderRadius: "0px 0px 0px 0px" }} ease="easeOut" duration={0.1} />
                        </Timeline>

                        {
                            this.props.storyIndex === 0 &&
                            <div className="overlay" ref={this.refOverlayCallback}></div>
                        }
                        <div className="content-mask">

                            <div className="card-img-overlay" >

                                <div className="intro" ref={this.refTitleCallback}>
                                    {
                                        this.props.storyIndex === 0 &&
                                        this.props.storyEmailPage &&
                                        <div className="barnes-logo">
                                            <img src={barnes_logo} alt="barnes_logo" />
                                        </div>
                                    }
                                    {
                                        this.props.storyIndex === 0 &&
                                        <div className="story-name">
                                            {storyTitle}
                                        </div>
                                    }
                                    
                                </div>
                                {
                                        this.props.storyIndex === 0 &&
                                        this.props.storyEmailPage &&
                                        <div className="scroll-cta" ref={this.refScrollTextCallback}>
                                            <div className="scroll-icon">
                                                <img src={scroll_up} alt="scroll"/>
                                            </div>
                                            <div className="text">{`Scroll to Begin`}</div>
                                        </div>
                                }
                                <div className="scroll-text" ref={this.refContentCallback}>
                                    <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                                    <div className="story-text" dangerouslySetInnerHTML={{ __html: story.long_paragraph.html }} />
                                    <p className="story-footer">{story.detail.title}, {story.detail.displayDate}<br /> {story.detail.people}</p>
                                    {
                                        this.props.selectedLanguage.code !== LANGUAGE_EN &&
                                        <div className="google-translate-disclaimer"><span>Translated with </span><img src={google_logo} alt="google_logo" /></div>
                                    }
                                </div>
                            </div>

                        </div>


                    </div>
                </Timeline>
            </div>

        );
    }
}

export default StoryItem;














