import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

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

class WelcomeComponent extends Component {

    state = {
        selectedLanguage: localStorage.getItem('barnes.snap.pref.lang') || 'English (Default)',
        modalIsOpen: false,
        languageOptions: [
            'English (Default)',
            '中文',
            'Français',
            'Deutsch',
            'Italiano',
            '日本語',
            '한국어',
            'русский',
            'Español'
        ]
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

        Modal.setAppElement('#language-select');
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    }

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    }

    selectLanguage = (e) => {
        const selectedLanguage = e.currentTarget.dataset.id;
        this.setState({ selectedLanguage: selectedLanguage });
        localStorage.setItem('barnes.snap.pref.lang', selectedLanguage);
        this.closeModal();
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
                            <div id="language-select" className="language-select text-center">

                                <h1>Please select your language</h1>

                                <div className="row">
                                    <div className="col-12 col-md-4 offset-md-4">
                                        <div className="btn-group d-flex" role="group">
                                            <button className="btn btn-secondary btn-lg w-100" type="button" onClick={this.openModal}>
                                                {this.state.selectedLanguage}
                                            </button>
                                            <button type="button" className="btn btn-lg btn-secondary dropdown-toggle dropdown-toggle-split" onClick={this.openModal}>
                                                <span className="sr-only">Toggle Dropdown</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Modal
                                    isOpen={this.state.modalIsOpen}
                                    onRequestClose={this.closeModal}
                                    contentLabel="Example Modal"
                                    className="Modal"
                                    overlayClassName="Overlay"
                                >
                                    <button type="button" className="close pull-right offset-11" aria-label="Close" onClick={this.closeModal}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                    <h1>Please select your language.</h1>
                                    <p>We are using Google to help us automatically translate our text.</p>
                                    <ul className="list-group">
                                        {this.state.languageOptions.map(lang => <li className="list-group-item" key={lang} data-id={lang} onClick={this.selectLanguage}>{lang}</li>)}
                                    </ul>
                                </Modal>
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
            </div >
        );
    }
}

export default WelcomeComponent;

