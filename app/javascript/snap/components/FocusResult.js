import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import withOrientation from './withOrientation';
import withTranslation from './withTranslation';

import { SearchRequestService } from '../services/SearchRequestService';

import Artwork from '../components/Artwork';
import StoryItem from './StoryItem';
import { Transition, animated } from 'react-spring/renderprops';
import { Swipeable } from 'react-swipeable';

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class FocusResult extends Component {


    constructor(props) {
        super(props);
        console.log('FocusResult >> constructor');

        this.sr = new SearchRequestService();
        let w = screen.width;
        let h = screen.height;

        this.state = {
            ...props.location.state,  // these properties are passed on from Camera component. Contains {result}
            "stories": [
                {
                    "id": 6964,
                    "show": true,
                    "height": 823,
                    "art_url": "https://barnes-images.imgix.net/6964_RehDRhZC5bQtSnko_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                    "title": "Mother and Child",
                    "short_para": "Between 1912 and 19591, Albert C. Barnes amassed an astonishing 181 works by Pierre- Auguste Renoir. It is the largest collection in the world.",
                    "info": "Young Mother (Juene mére), 1881.",
                    "artist": "Pierre-Auguste Renoir."

                },
                {
                    "id": 7020,
                    "show": false,
                    "height": 823,
                    "art_url": "https://barnes-images.imgix.net/7020_f2wbizJUVJhRvCyC_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                    "title": "Seated Nude",
                    "short_para": "Renoir is best known for his impressionist paintings made during the 1870s. Barnes vastly preferred Renoir's latest canvases, however, because they seemed modern and classical at the same time. The 1910 nude is a good example.",
                    "info": "Bather Drying Herself (Baigneuse Séssuyant). c. 1908.",
                    "artist": "Pierre-Auguste Renoir."
                },
                {
                    "id": 7019,
                    "show": false,
                    "height": 823,
                    "art_url": "https://barnes-images.imgix.net/7019_nfDkcKrMa9lLxn1W_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                    "title": "Jeanne-Durrand-Ruel",
                    "short_para": "Barnes purchased over half of his Renoirs from Paul Durrand-Ruel, the famous impressionist dealer who had galleries in Paris and New York. This is a portrait of his daughter, Jeanne.",
                    "info": "Portrait of Jeanne Durrand-Ruel(Portrait de Mlle. J.). 1876.",
                    "artist": "Pierre-Auguste Renoir."
                },
                {
                    "id": 6981,
                    "show": false,
                    "height": 823,
                    "art_url": "https://barnes-images.imgix.net/6981_BlvD0VojmGU5ETzC_b.jpg?q=0&auto=compress&crop=faces,entropy&fit=crop&w=" + w + "&h=" + h,
                    "title": "Odalisque with Tea Set",
                    "short_para": "Renoir died in 1919, leaving behind more the 700 canvasses in his Cagnes-sur-Mer studio. Eager for a glimpse, Barnes travelled there in 1921 -a visit he later described as \" one of the most delightful experiences I ever had.\". He would eventually buy 41 studio painings from the Renoir sons.",
                    "info": "Odalisque with Tea Set (Odalisque á la théiére)",
                    "artist": "Pierre-Auguste Renoir."
                }
            ],
            index: 0

        }

    }

    async componentWillMount() {
        console.log('FocusResult >> componentWillMount');
        let imageId = (this.state.result) ? this.state.result.data.records[0].id : this.props.match.params.imageId;
        this.setupStory(imageId)

    }

    setupStory = async (imageId) => {
        console.log('imageid = ' + imageId);
        //let stories = await this.sr.getStoryItems(imageId);
        // if (stories.length > 0) {
        //     this.setState({stories});
        // }
    }

    renderStoryItem = (index, style) => {
        const story = this.state.stories[index];
        return <StoryItem story={story} style={style} />
    }

    toggle = e =>
        this.setState(state => ({
            index: state.index === 3 ? 3 : state.index + 1,
        }));

    swiped = (e, deltaX, deltaY, isFlick, velocity) => {
        console.log("You Swiped...", e, deltaX, deltaY, isFlick, velocity)

        const targetClass = e.event.target.className.split(' ');
        console.log(targetClass);
        if (e.dir = 'Up') {
            if (targetClass.includes('story-img')) {
                this.setState(state => ({
                    index: state.index === 3 ? 3 : state.index + 1,
                }));
            } else {
                this.setState(state => ({
                    index: 0,
                }));
            }
        } else {
            if (targetClass.includes('story-img')) {
                this.setState(state => ({
                    index: state.index === 0 ? 0 : state.index - 1,
                }));
            } else {
                this.setState(state => ({
                    index: 0,
                }));
            }
        }
    }

    render() {
        const zIndexCurrent = 100 * this.state.index;
        const zIndexPrev = zIndexCurrent - 100;
        console.log(this.state.index);
        return (
            <Swipeable
                onSwiped={this.swiped}>
                <Artwork result={this.state.result} />

                <div className="story-container">
                    <Transition
                        native
                        unique
                        items={this.state.index}
                        from={{ opacity: 1, transform: 'translate3d(0,100%,0)' }}
                        enter={{ opacity: 1, zIndex: zIndexCurrent, borderRadius: `40px 40px 0 0`, transform: 'translate3d(0,80%,0)' }}
                        leave={{ opacity: 1, zIndex: zIndexPrev, borderRadius: `0px`, transform: 'translate3d(0, 0%,0)' }}
                    >
                        {index => style => (
                            <animated.div className="story-item" style={{ ...style }} onClick={this.toggle}>
                                {this.renderStoryItem(index, style)}
                            </animated.div>
                        )}
                    </Transition>

                </div>
            </Swipeable >
        );
    }
}

export default FocusResult;