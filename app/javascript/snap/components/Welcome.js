import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

import LanguageSelect from '../components/LanguageSelect';
import Hammer from 'hammerjs';
import Modal from 'react-modal';

import img1 from 'images/welcome-img1.jpg';
import img2 from 'images/welcome-img2.jpg';
import img3 from 'images/welcome-img3.jpg';
import img4 from 'images/lang-img1.jpg';
import img5 from 'images/lang-img2.jpg';
import img6 from 'images/lang-img3.jpg';
import img7 from 'images/wifi-img1.jpg';
import img8 from 'images/wifi-img2.jpg';
import img9 from 'images/wifi-img3.jpg';
import photo_prompt from 'images/photo-prompt.jpg';
import icon_camera from 'images/camera_icon.svg';
import axios from 'axios';

class WelcomeComponent extends Component {

    constructor(props) {
        super(props);
    }

    checkIndex = () => {
        const $this = $("#snapCarousel");
        if ($("#snapCarousel .carousel-inner .carousel-item:first").hasClass("active")) {
            $this.children(".carousel-control-prev").hide();
            $this.children(".carousel-control-next").show();
            $this.children(".carousel-indicators").show();
        } else if ($("#snapCarousel .carousel-inner .carousel-item:last").hasClass("active")) {
            $this.children(".carousel-control-next").hide();
            $this.children(".carousel-control-prev").hide();
            $this.children(".carousel-indicators").hide();
        } else {
            $this.children(".carousel-control-prev").show();
            $this.children(".carousel-control-next").show();
            $this.children(".carousel-indicators").show();
        }
    };

    componentDidMount() {

        this.checkIndex();

        const settings = {
            interval: false,
            wrap: false
        };
        // axios
        //     .get('/api/snaps/languages?language=en')
        //     .then((response) => {
        //         var prefLang = localStorage.getItem('barnes.snap.pref.lang') || "en";
        //         var savedLanguage = response.data.find(function (obj) { return obj.code === prefLang; });
        //         this.setState({ languageOptions: response.data, selectedLanguage: savedLanguage });
        //     })
        //     .catch((e) => {
        //         console.error(e);
        //     });

        $('#snapCarousel').carousel(settings);

        $('#snapCarousel').each(function () {
            var $carousel = $(this);
            var hammertime = new Hammer(this, {
                recognizers: [
                    [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0 }],
                    [Hammer.Pinch, { enable: true }]
                ]
            });
            hammertime.on('swipeleft', function () {
                $carousel.carousel('next');
            });
            hammertime.on('swiperight', function () {
                $carousel.carousel('prev');
            });
        });

        $('#snapCarousel').on('slid.bs.carousel', () => {
            this.checkIndex();
        })
    }

    render() {
        return (
            <div id="snapCarousel" className="carousel slide">
                <ol className="carousel-indicators">
                    <li data-target="#snapCarousel" data-slide-to="0" className="active"></li>
                    <li data-target="#snapCarousel" data-slide-to="1"></li>
                    <li data-target="#snapCarousel" data-slide-to="2"></li>
                    <li data-target="#snapCarousel" data-slide-to="3"></li>
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
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="lang-dropdown-screen">
                            <div className="img-gallery">
                                <div className="gallery-item">
                                    <img src={img4} alt="img4" />
                                </div>
                                <div className="gallery-item">
                                    <img src={img5} alt="img5" />
                                </div>
                                <div className="gallery-item">
                                    <img src={img6} alt="img6" />
                                </div>
                            </div>
                            <div>
                                <h1>Please select your language.</h1>
                                <LanguageSelect />
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="wifi-screen">
                            <div className="img-gallery">
                                <div className="gallery-item">
                                    <img src={img7} alt="wifi-img1" />
                                </div>
                                <div className="gallery-item">
                                    <img src={img8} alt="wifi-img2" />
                                </div>
                                <div className="gallery-item">
                                    <img src={img9} alt="wifi-img3" />
                                </div>
                            </div>
                            <div className="content">

                                <h1>Get connected.</h1>

                                <p>For best connectivity, please connect to our free wifi: BarnesPublic.</p>

                            </div>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className="photo-prompt-screen">
                            <div className="img-main">
                                <img src={photo_prompt} alt="photo_prompt_main_img" />
                            </div>
                            <div className="content">
                                <h1>Take a photo to learn more about a work of art in our collection.</h1>
                            </div>

                            <Link className="btn take-photo-btn" to="/snap">
                                Take Photo
                                <span className="icon">
                                    <img src={icon_camera} alt="camera_icon" />
                                </span>
                            </Link>
                        </div>

                    </div>
                </div>
                <a className="carousel-control-prev" href="#snapCarousel" role="button" data-slide="prev">
                    <i className="fa fa-2x fa-angle-left"></i>
                    <span className="sr-only">Previous</span>
                </a>
                <a className="carousel-control-next" href="#snapCarousel" role="button" data-slide="next">
                    <i className="fa fa-2x fa-angle-right"></i>
                    <span className="sr-only">Next</span>
                </a>
            </div >
        );
    }
}

export default WelcomeComponent;

