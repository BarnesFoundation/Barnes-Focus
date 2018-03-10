import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';

import { Link } from 'react-router-dom';
import img1 from 'images/welcome-img1.jpg';
import img2 from 'images/welcome-img2.jpg';
import img3 from 'images/welcome-img3.jpg';

class WelcomeComponent extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const settings = {
            interval: false
        };
        $('#snapCarousel').carousel(settings);

        $('#snapCarousel').each(function () {
            var $carousel = $(this);
            var hammertime = new Hammer(this, {
                recognizers: [
                    [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
                ]
            });
            hammertime.on('swipeleft', function () {
                $carousel.carousel('next');
            });
            hammertime.on('swiperight', function () {
                $carousel.carousel('prev');
            });
        });
    }

    render() {
        return (
            <div id="snapCarousel" className="carousel slide">
                <ol className="carousel-indicators">
                    <li data-target="#snapCarousel" data-slide-to="0" className="active"></li>
                    <li data-target="#snapCarousel" data-slide-to="1"></li>
                    <li data-target="#snapCarousel" data-slide-to="2"></li>
                </ol>
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <div className="welcome-screen">
                            <div className="img-gallery">
                                <div className="gallery-item">
                                    <img src={img1} alt="img1" />
                                </div>
                                <div className="gallery-item">
                                    <img src={img2} alt="img2" />
                                </div>
                                <div className="gallery-item">
                                    <img src={img3} alt="img3" />
                                </div>
                            </div>
                            <div className="content">

                                <h1>It's a snap!</h1>

                                <p>Take a photo of any work of art to get information about it.</p>
                                <Link className="btn btn-primary" to="/snap">Continue</Link>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <h1>Second Slide</h1>
                    </div>
                    <div className="carousel-item">
                        <h1>Third Slide</h1>
                    </div>
                </div>
                <a className="carousel-control-prev" href="#snapCarousel" role="button" data-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="sr-only">Previous</span>
                </a>
                <a className="carousel-control-next" href="#snapCarousel" role="button" data-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="sr-only">Next</span>
                </a>
            </div>
        );
    }
}

export default WelcomeComponent;

