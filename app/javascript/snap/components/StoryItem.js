import React from 'react';
import { animated } from 'react-spring/renderprops';

class StoryItem extends React.Component {

    render() {
        return (
            <div className="story-container">
                <div className="card img-fluid" style={{ width: `100%` }}>
                    <img className="card-img-top" src={this.props.story.art_url} alt="story_item" style={{ width: `100%` }} />
                    <div className="card-img-overlay">
                        <p className="story-title">{this.props.story.title}</p>
                        <p className="card-text">{this.props.story.short_para}</p>
                        <p className="">{this.props.story.info}</p>
                        <small className="">{this.props.story.artist}</small>
                    </div>
                </div>
            </div>
        );
    }
}

export default StoryItem;