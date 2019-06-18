import React from 'react';
import { animated, config } from 'react-spring/renderprops';


class StoryItem extends React.Component {

    constructor(props) {
        super(props);
        this.cardRef = React.createRef();
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

    render() {
        return (
            <div className="card" style={{ width: `100%` }} ref={this.cardRef}>
                <img className="card-img-top" src={this.props.story.art_url} alt="story_item" style={{ width: `100%` }} />
                <div className="card-img-overlay">
                    {this.props.isFirstItem && <div className="story-question">Why so many Renoirs?</div>}
                    <p className="story-title">{this.props.story.title}</p>
                    <p className="story-text">{this.props.story.short_para}</p>
                    <p className="story-footer">{this.props.story.info} <br /> {this.props.story.artist}</p>
                </div>
            </div>

        );
    }
}

export default StoryItem;