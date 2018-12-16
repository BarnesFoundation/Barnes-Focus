import React, { Component } from 'react';
import Slider from 'react-slick';


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
    }

    afterChangeHandler = (currentSlide) => {
        console.log('Active slide :: ' + currentSlide);
        this.setState({ activeSlideIndex: currentSlide });
    }

    render() {
        //console.log('this.props.blurValue = ' + this.props.blurValue);
        let sliderBackground = {
            filter: `blur(` + this.props.blurValue + `px)`
        }
        return (
            <div>

                <div className="slider-background" style={sliderBackground}>
                    <img src={this.props.alsoInRoomResults[this.state.activeSlideIndex] + this.sliderBackgroundCropParams} />
                </div>

                <div className="slider-header"><h2>Also in this Room</h2></div>
                <div className="slider-container">
                    <Slider {...sliderSettings} afterChange={this.afterChangeHandler}>
                        {
                            this.props.alsoInRoomResults.map((result, index) =>
                                <div key={index}><img src={result + this.sliderCropParams} /></div>
                            )
                        }
                    </Slider>
                </div>
            </div>
        );
    }
}

export default InRoomSlider;