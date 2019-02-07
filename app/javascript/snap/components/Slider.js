import React, { Component } from 'react';
import Slider from 'react-slick';
import CrossfadeImage from 'react-crossfade-image';
import ProgressiveImage from 'react-progressive-image';

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

        this.cropParamsHQ = '?crop=faces,entropy&fit=crop&h=230&w=230';
        this.sliderCropParams = '?q=0&auto=compress&crop=faces,entropy&fit=crop&h=230&w=230';
        this.sliderBackgroundCropParams = '?q=0&auto=compress&crop=faces,entropy&fit=crop&h=540&w=' + screen.width;
        this.touchThreshold = 5;
    }

    componentDidMount() {
        const slider = document.getElementById('aitr-slider');
        slider.addEventListener('touchstart', this._touchStart);
        slider.addEventListener('touchmove', this._onTouchMove, { passive: false });

        /** cache AitR backgroud images for smoother transition */
        this.props.alsoInRoomResults.map((record, index) => {
            let image = new Image();
            image.src = this.props.alsoInRoomResults[index].art_url + this.sliderBackgroundCropParams;
        });
    }

    componentWillUnmount() {
        const slider = document.getElementById('aitr-slider');
        slider.removeEventListener('touchstart', this._touchStart);
        slider.removeEventListener('touchmove', this._onTouchMove, { passive: false });
    }

    _touchStart = (e) => {
        this.firstClientX = e.touches[0].clientX;
    }

    _onTouchMove = (e) => {
        // only prevent touch on horizontal scroll (for horizontal carousel)
        // this allows the users to scroll vertically past the carousel when touching the carousel
        // this also stabilizes the horizontal scroll somewhat, decreasing vertical scroll while horizontal scrolling
        const clientX = e.touches[0].clientX - this.firstClientX;
        const horizontalScroll = Math.abs(clientX) > this.touchThreshold;
        if (horizontalScroll && e.cancelable) {
            e.preventDefault();
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

                <div className="slider-header h2">{this.props.getTranslation('Result_page', 'text_2')}</div>
                <div className="slider-container" id="aitr-slider">
                    <Slider {...sliderSettings} beforeChange={this.beforeChangeHandler}>
                        {
                            this.props.alsoInRoomResults.map((record, index) =>
                                <div key={record.id} onClick={() => this._handleOnClick(record.id)}>
                                    {/* <img src={record.art_url + this.sliderCropParams} /> */}
                                    <ProgressiveImage delay={2000} src={record.art_url + this.cropParamsHQ} placeholder={record.art_url + this.sliderCropParams}>
                                        {src => <img src={src} alt="aitr_image" />}
                                    </ProgressiveImage>
                                </div>
                            )
                        }
                    </Slider>
                </div>
            </div>
        );
    }
}

export default InRoomSlider;