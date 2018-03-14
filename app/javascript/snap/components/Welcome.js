import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';

import { Link } from 'react-router-dom';
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

class WelcomeComponent extends Component {

    state = {
        selectedLanguage: 'English'
    }

    componentDidMount() {
        const settings = {
            interval: false,
            wrap: false
        };
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
                console.log('swipeleft');
                $carousel.carousel('next');
            });
            hammertime.on('swiperight', function () {
                console.log('swiperight');
                $carousel.carousel('prev');
            });
        });

        $('.dropdown-toggle').dropdown();
    }

    handleChange = (ev) => {
        this.setState({ selectedLanguage: ev.target.value });

        setTimeout(() => { console.log(`Selected: ` + this.state.selectedLanguage) })
    }

    render() {
        const { selectedLanguage } = this.state;
        const lang = selectedLanguage && selectedLanguage.value;
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
                                {/* <Link className="btn btn-primary" to="/snap">Continue</Link> */}
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
                            <div className="content">

                                <h2>Please select your language</h2>

                                {/* <select className="custom-select">
                                    <option value="English" selected>English (Default)</option>
                                    <option value="Français">Français</option>
                                    <option value="Deutsch">Deutsch</option>
                                    <option value="Italiano">Italiano</option>
                                    <option value="Español">Español</option>
                                </select> */}

                                {/* <Select
                                    name="form-field-name"
                                    value={lang}
                                    onChange={this.handleChange}
                                    options={[
                                        { value: 'English', label: 'English (Default)' },
                                        { value: 'Français', label: 'Français' },
                                        { value: 'Deutsch', label: 'Deutsch' },
                                        { value: 'Italiano', label: 'Italiano' },
                                        { value: 'Español', label: 'Español' }

                                    ]}
                                /> */}

                                <form onSubmit={this.handleSubmit}>
                                    <label>

                                        <select value={this.state.selectedLanguage} onChange={this.handleChange}>
                                            <option value="English">English (Default)</option>
                                            <option value="Français">Français</option>
                                            <option value="Deutsch">Deutsch</option>
                                            <option value="Italiano">Italiano</option>
                                            <option value="Español">Español</option>
                                        </select>
                                    </label>
                                </form>

                                {/* <div className="dropdown">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        English (Default)
  </button>
                                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <a className="dropdown-item" href="#">Français</a>
                                        <a className="dropdown-item" href="#">Deutsch</a>
                                        <a className="dropdown-item" href="#">Italiano</a>
                                        <a className="dropdown-item" href="#">Español</a>
                                    </div>
                                </div> */}
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

