import { Linear, TimelineLite } from 'gsap/all';
import barnes_logo from 'images/barnes_email_logo_1x.png';
import google_logo from 'images/google_translate.svg';
import scroll_up from 'images/up_wht_1x.png';
import React from 'react';
import { Timeline, Tween } from 'react-gsap';
import { LANGUAGE_EN, VIEWPORT_HEIGHT, SNAP_LANGUAGE_PREFERENCE } from './Constants';
import { isAndroid } from 'react-device-detect';

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
    };

    this.masterTimelineGSAP = null;
    this.imgTopTimelineGSAP = null;
    this.overlayTimelineGSAP = null;
  }

  componentDidMount() {
    //console.log('StoryItem >> componentDidMount');
    this.scrollInProgress = false;
    this.setState({ scrollHeight: this.contentRef.clientHeight });
    this.t2 = new TimelineLite({ paused: true });

    this.masterTimelineGSAP = this.masterTimeline.getGSAP();
    this.imgTopTimelineGSAP = this.imgTopTimeline.getGSAP();
    this.overlayTimelineGSAP = this.overlayTimeline.getGSAP();
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
      let showTitle = nextProps.sceneStatus.type === 'start' && nextProps.sceneStatus.state === 'DURING';
      if (this.props.sceneStatus.state != nextProps.sceneStatus.state || this.props.sceneStatus.type === 'enter') {
        this.props.statusCallback(showTitle);
        this.setState({ showTitle: !showTitle });
      }
    }
  }

  componentDidUpdate() {
    //console.log("StoryItem >> ComponentDidUpdate");
    // console.log("Did Update Scene Status", this.props.sceneStatus)
    if (!this.state.heightUpdated) {
      var contentHeight = this.contentRef.getBoundingClientRect().height;
      var offset;
      offset = contentHeight > VIEWPORT_HEIGHT ? contentHeight - VIEWPORT_HEIGHT + 67 : 0;
      if (offset < 0) offset = 0;
      // console.log("SCROLL OFFSET", offset);

      this.props.getSize(offset, this.props.storyIndex);
      this.setState({ heightUpdated: true, scrollOffset: offset });

      // console.log("Setting TWEEN OFFSET", offset, contentHeight, h);
      if (this.props.storyIndex === 0) {
        if (this.props.storyEmailPage) {
          this.t2
            .fromTo(this.overlayRef, 0.1, { autoAlpha: 0.5 }, { autoAlpha: 0 })
            .fromTo(this.titleRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
            .fromTo(this.scrollCtaRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
            .fromTo(this.contentRef, 0.1, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' }, '-=0.1')
            .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, '-=0.1');
        } else {
          this.t2
            .fromTo(this.overlayRef, 0.1, { autoAlpha: 0.5 }, { autoAlpha: 0 }, 0)
            .fromTo(this.contentRef, 0.15, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' }, 0)
            .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, '-=0.16');
        }
      } else if (this.props.isLastStoryItem) {
        this.t2
          .fromTo(this.contentRef, 0.15, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' })
          .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, '-=0.16');
      } else {
        this.t2
          .fromTo(this.contentRef, 0.15, { autoAlpha: 0, y: '50px' }, { autoAlpha: 1, y: '0px' })
          .fromTo(this.contentRef, 1.0, { y: '0px' }, { y: -offset, ease: Linear.easeNone }, '-=0.16');
      }
    }

    if (this.t2) this.t2.progress(this.props.progress * 4);
  }

  componentWillUnmount() {
    this.masterTimelineGSAP.remove();
    this.masterTimelineGSAP.kill();
    this.imgTopTimelineGSAP.remove();
    this.imgTopTimelineGSAP.kill();
    this.overlayTimelineGSAP.remove();
    this.overlayTimelineGSAP.kill();

    this.t2.remove();
    this.t2.kill();
  }

  getArtUrl = () => {
    return this.props.story.detail.art_url + `?crop=faces,entropy&fit=crop&w=` + screen.width + `&h=` + screen.height;
  };

  refContentCallback = element => {
    if (element) {
      this.contentRef = element;
      // this.props.getSize(element.getBoundingClientRect().height, this.props.key);
    }
  };

  refTitleCallback = element => {
    if (element) {
      this.titleRef = element;
    }
  };

  refOverlayCallback = element => {
    if (element) {
      this.overlayRef = element;
    }
  };

  refScrollTextCallback = element => {
    if (element) {
      this.scrollCtaRef = element;
    }
  };

  isUnidentifiedArtist = () => {
    return this.props.story.detail.people.toLowerCase().includes('unidentified');
  };

  render() {
    const { story, storyTitle, progress, storyIndex } = this.props;
    const peekOffsetStyle =
      isAndroid && storyIndex === 0
        ? { transform: 'translate3d(0px, -123px, 0px)' } // 67 + 56 (address bar height compensation for android)
        : { transform: 'translate3d(0px, -67px, 0px)' };
    const paragraphFontStyle = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) === 'Ru' ? { fontSize: `16px` } : {};
    return (
      <div>
        <Timeline totalProgress={progress} paused ref={ref => (this.masterTimeline = ref)}>
          <div className="card story-item" style={peekOffsetStyle}>
            {this.props.storyIndex === 0 && this.state.showTitle && !this.props.storyEmailPage && (
              <div className="story-title-bar">
                <div className="story-title">{storyTitle}</div>
              </div>
            )}
            <Timeline
              totalProgress={progress * 5}
              paused
              target={
                <img className="card-img-top" src={this.getArtUrl()} alt="story_item" style={{ width: `100%` }} />
              }
              ref={ref => (this.imgTopTimeline = ref)}>
              {
                <Tween
                  from={{ css: { borderRadius: '24px 24px 0px 0px' } }}
                  to={{ css: { borderRadius: '0px 0px 0px 0px' } }}
                  ease="easeOut"
                  duration={0.2}
                />
              }
            </Timeline>

            <Timeline
              totalProgress={progress * 5}
              paused
              target={<div className="overlay" />}
              ref={ref => (this.overlayTimeline = ref)}>
              <Tween
                from={{ autoAlpha: 0, borderRadius: '24px 24px 0px 0px' }}
                to={{ autoAlpha: 0.6, borderRadius: '0px 0px 0px 0px' }}
                ease="easeOut"
                duration={0.1}
              />
            </Timeline>

            {this.props.storyIndex === 0 && <div className="overlay" ref={this.refOverlayCallback} />}
            <div className="content-mask">
              <div className="card-img-overlay">
                {this.props.storyEmailPage && this.props.storyIndex === 0 && (
                  <div>
                    <div className="intro" ref={this.refTitleCallback}>
                      <div className="barnes-logo">
                        <img src={barnes_logo} alt="barnes_logo" />
                        <div className="story-name">{storyTitle}</div>
                      </div>
                    </div>
                    <div className="scroll-cta" ref={this.refScrollTextCallback}>
                      <div className="scroll-icon">
                        <img src={scroll_up} alt="scroll" />
                      </div>
                      <div className="text">{`Scroll to Begin`}</div>
                    </div>
                  </div>
                )}
                <div className="scroll-text" ref={this.refContentCallback}>
                  {!this.props.storyEmailPage && <div className="story-name" id={`story-here-${storyIndex}`}>{storyTitle}</div>}
                  <div
                    className="story-text" id={`story-text-${this.props.storyIndex}`}
                    style={paragraphFontStyle}
                    dangerouslySetInnerHTML={{
                      __html:
                        process.env.STORY_PARAGRAPH_TO_USE === 'long'
                          ? story.long_paragraph.html
                          : story.short_paragraph.html
                    }}
                  />
                  <div
                    className="story-footer"
                    style={{
                      paddingBottom: this.props.selectedLanguage.code === LANGUAGE_EN ? `200px` : 0
                    }}>
                    {story.detail.title}, {story.detail.displayDate}
                    <br />
                    {story.detail.people}
                    {this.isUnidentifiedArtist()
                      ? ''
                      : ` (${story.detail.nationality}, ${story.detail.birthDate} - ${story.detail.deathDate})`}
					{this.isUnidentifiedArtist() ? `, ${story.detail.culture}` : ''}
                  </div>
                  {this.props.selectedLanguage.code !== LANGUAGE_EN && (
                    <div className="google-translate-disclaimer" style={{ paddingBottom: `200px` }}>
                      <span>Translated with </span>
                      <img src={google_logo} alt="google_logo" />
                    </div>
				  )}
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
