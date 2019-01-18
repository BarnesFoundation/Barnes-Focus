import React, { Component } from 'react';
import Slider from 'react-slick';
import CrossfadeImage from 'react-crossfade-image';

const sliderSettings = {
    className: "slider-container",
    arrows: false,
    swipe: true,
    speed: 200,
    centerMode: true,
    centerPadding: `${(screen.width - 260) / 2}px`,
    cssEase: 'linear',
    mobileFirst: true,
    variableWidth: false,
    slidesToShow: 1,
    slidesToScroll: 1
};

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

    componentDidMount() {
        window.addEventListener('touchstart', this._touchStart);
        window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    }

    componentWillUnmount() {
        window.removeEventListener('touchstart', this._touchStart);
        window.removeEventListener('touchmove', this._onTouchMove, { passive: false });
    }

    _touchStart = (e) => {
        this.firstClientX = e.touches[0].clientX;
        this.firstClientY = e.touches[0].clientY;
    }

    _onTouchMove = (e) => {
        const minValue = 5; // threshold

        this.clientX = e.touches[0].clientX - this.firstClientX;
        this.clientY = e.touches[0].clientY - this.firstClientY;

        // Vertical scrolling does not work when you start swiping horizontally.
        if (Math.abs(this.clientX) > minValue) {
            e.preventDefault();
            e.returnValue = false;
            return false;
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
        this.sliderCropParams = '?crop=faces,entropy&fit=crop&h=230&w=230';
        this.sliderBackgroundCropParams = '?crop=faces,entropy&fit=crop&h=540&w=' + screen.width;
        this.setState({ activeSlideIndex: 0 });
        this.props.onSelectInRoomArt(id);
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

                <div className="slider-header h2">Also in this Room</div>
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

export default InRoomSlider;