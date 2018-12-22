import React, { Component } from 'react';
import Slider from 'react-slick';
import CrossfadeImage from 'react-crossfade-image';
import { withRouter } from 'react-router-dom';
import { ART_WORK_INFO_URL } from './Constants';
import axios from 'axios';

const sliderSettings = {
    className: "slider-container",
    centerMode: true,
    arrows: false,
    swipe: true,
    speed: 200,
    centerPadding: '72px',
    cssEase: 'linear',
    mobileFirst: true,
    slidesToShow: 1,
    slidesToScroll: 1
};

/** 
 * withRouter HOC provides props with location, history and match objects
*/
class InRoomSlider extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeSlideIndex: 0
        }

        this.sliderCropParams = '?crop=faces,entropy&fit=crop&h=230&w=230';
        this.sliderBackgroundCropParams = '?crop=faces,entropy&fit=crop&h=540&w=' + screen.width;

        /* this.swipeX;
        this.firstClientX */
    }

    /* componentDidMount() {
        window.addEventListener('touchstart', this._touchStart);
        window.addEventListener('touchmove', this._debounced(200, this._onTouchMove), { passive: false });
    }

    componentWillUnmount() {
        window.removeEventListener('touchstart', this._touchStart);
        window.removeEventListener('touchmove', this._debounced(200, this._onTouchMove), { passive: false });
    } */

    _touchStart = (e) => {
        this.firstClientX = e.touches[0].clientX;
        //this.firstClientY = e.touches[0].clientY;
    }

    _onTouchMove = (e) => {
        this.swipeX = e.touches[0].clientX - this.firstClientX;
        //this.clientY = e.touches[0].clientY - this.firstClientY;
        console.log('Touch move X is ' + this.swipeX);
        let activeSlide;
        if (!isNaN(this.swipeX)) {

            // scroll right to left
            if (this.swipeX < 0 && Math.abs(this.swipeX > 100)) {
                activeSlide = (this.state.activeSlideIndex === this.props.alsoInRoomResults.length - 1) ? -1 : this.state.activeSlideIndex;
                console.log('active slide RTL == ' + activeSlide);
                this.setState({ nextSlide: this.state.activeSlideIndex + 1 });
            }
            // scroll left to right
            else if (this.swipeX > 0 && Math.abs(this.swipeX > 100)) {
                activeSlide = (this.state.activeSlideIndex === 0) ? this.props.alsoInRoomResults.length : this.state.activeSlideIndex;
                console.log('active slide LTR == ' + activeSlide);
                this.setState({ nextSlide: this.state.activeSlideIndex - 1 });
            }
        }


    }

    _debounced = (delay, fn) => {
        let timerId;
        return function (...args) {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => {
                fn(...args);
                timerId = null;
            }, delay);
        }
    }

    _handleOnClick = (id) => {
        console.log('Also in room id = ' + id);

        axios.get(ART_WORK_INFO_URL + id)
            .then(response => {
                this.sliderCropParams = '?crop=faces,entropy&fit=crop&h=230&w=230';
                this.sliderBackgroundCropParams = '?crop=faces,entropy&fit=crop&h=540&w=' + screen.width;
                this.setState({ activeSlideIndex: 0 });
                this.props.onSelectInRoomArt(response.data);
            })
            .catch(error => {
                console.log(error);
            });

    }

    beforeChangeHandler = (oldSlide, nextSlide) => {
        this.setState({ activeSlideIndex: nextSlide });
    }


    render() {
        //console.log('this.props.blurValue = ' + this.props.blurValue);
        let sliderBackground = {
            filter: `blur(` + this.props.blurValue + `px)`
        }
        return (
            <div>

                <div className="slider-background" style={sliderBackground}>
                    <CrossfadeImage src={this.props.alsoInRoomResults[this.state.activeSlideIndex].art_url + this.sliderBackgroundCropParams} duration={1000}
                        timingFunction={"ease-out"} />
                    {/* <img src={this.props.alsoInRoomResults[this.state.activeSlideIndex].art_url + this.sliderBackgroundCropParams} /> */}
                </div>

                <div className="slider-header"><h2>Also in this Room</h2></div>
                <div className="slider-container">
                    <Slider {...sliderSettings} beforeChange={this.beforeChangeHandler}>
                        {
                            this.props.alsoInRoomResults.map((record, index) =>
                                <div key={index} onClick={() => this._handleOnClick(record.id)}><img src={record.art_url + this.sliderCropParams} /></div>
                            )
                        }
                    </Slider>
                </div>
            </div>
        );
    }
}

export default withRouter(InRoomSlider);