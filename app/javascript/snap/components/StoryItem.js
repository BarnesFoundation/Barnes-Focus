import React from 'react';
import { animated } from 'react-spring/renderprops';

class StoryItem extends React.Component {

    render() {
        return (

            <div className="card" style={{ width: `100%` }}>
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