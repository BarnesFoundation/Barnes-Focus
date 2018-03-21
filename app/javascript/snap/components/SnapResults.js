import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LanguageSelect from '../components/LanguageSelect';
import share from 'images/share_icon.svg';
import bookmark from 'images/bookmark_icon.svg';
import icon_camera from 'images/camera_icon.svg';
import Modal from 'react-modal';
import Footer from './Footer';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL } from './Constants';

/** 
 * withHeader HOC provides props with location, history and match objects
*/
class SnapResults extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props.location.state,
            modalIsOpen: false,
            bookmarkModalIsOpen: false,
            searchResults: []
        }
    }

    componentWillMount() {
        const search_result = this.state.result;
        if (search_result["success"]) {
            if (search_result["data"]["records"].length > 0) {
                const result = {};
                const art_obj = search_result["data"]["records"][0];
                const art_url = "https://barnes-image-repository.s3.amazonaws.com/images/" + art_obj['id'] + "_" + art_obj['imageSecret'] + "_n.jpg";
                result['title'] = art_obj.title;
                result['shortDescription'] = art_obj.shortDescription;
                result['artist'] = art_obj.people;
                result['classification'] = art_obj.classification;
                result['locations'] = art_obj.locations;
                result['medium'] = art_obj.medium;
                result['url'] = art_url
                result['invno'] = art_obj.invno;
                result['displayDate'] = art_obj.displayDate;
                result['shortDescription'] = art_obj.shortDescription;
                this.setState({
                    searchResults: this.state.searchResults.concat(result)
                });
            }

        } else {
            this.setState({ error: "No records found!" });
        }
    }

    componentDidMount() {
        Modal.setAppElement('.search-container');
    }

    bookmarkIt = () => {
        const email = localStorage.getItem(SNAP_USER_EMAIL);

        if (email) {
            this.submitBookMark();
        } else {
            this.setState({ bookmarkModalIsOpen: true });
        }
    }

    closeBookmarkModal = () => {
        this.setState({ bookmarkModalIsOpen: false });
    }

    submitBookMark = () => {
        console.log('submitting bookmark');
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    }

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    }

    resetExperience = () => {
        localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
        this.setState({ modalIsOpen: false });
    }

    render() {
        return (
            <div className="container-fluid search-container">

                <div className="row">
                    <div className="col-12 col-md-12">
                        <div className="card">
                            <img className="card-img-top" src={this.state.searchResults[0].url} alt="match_image" />
                            <div className="card-img-overlay">
                                <h5 className="card-title">{this.state.searchResults[0].title}</h5>
                            </div>
                            <Link type="button" className="btn btn-circle" to="/snap">
                                <img src={icon_camera} className="profile-avatar" alt="camera" />
                            </Link>
                            <div className="card-body">
                                <div className="d-flex justify-content-around action-icons">
                                    <span><img src={share} alt="share" />Share it</span>
                                    <span onClick={this.bookmarkIt}><img src={bookmark} alt="bookmark" />Bookmark it</span>
                                    <Modal
                                        isOpen={this.state.bookmarkModalIsOpen}
                                        onRequestClose={this.closeBookmarkModal}
                                        contentLabel="Bookmark Modal"
                                        className="Modal"
                                        overlayClassName="Overlay"
                                    >
                                        <div className="bookmark">
                                            <div className="row">
                                                <div className="col-12">
                                                    <i className="fa fa-2x fa-angle-left pull-left"></i>
                                                    <span className="dismiss" onClick={this.closeBookmarkModal}>
                                                        Go back
                                                </span>
                                                </div>
                                            </div>
                                            <div className="title mt-5">
                                                <h2>{this.state.searchResults[0].title}</h2>
                                            </div>
                                            <div className="picture">
                                                <img src={this.state.searchResults[0].url} alt="bookmark_img" />
                                            </div>
                                            <div className="message">Information about the art you bookmark will be emailed to you after your visit.</div>
                                            <form onSubmit={this.handleSubmit}>
                                                <input type="email" placeholder="Email address" className="form-control" name="email" />
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" value="" id="newsletter-chk" />
                                                    <label className="form-check-label snap-text-muted" htmlFor="newsletter-chk">
                                                        Sign up for the Barnes newsletter
                                                        </label>
                                                </div>
                                            </form>
                                            <div className="row">
                                                <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                                                    <button className="btn snap-btn snap-btn-default" onClick={this.submitBookMark}>
                                                        Submit
                                                     </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Modal>
                                </div>
                                <hr />
                                <p className="card-text">
                                    <small className="text-muted">{this.state.searchResults[0].artist}. {this.state.searchResults[0].title}, {this.state.searchResults[0].displayDate}. {this.state.searchResults[0].medium}</small>
                                </p>
                                <p className="card-text">{this.state.searchResults[0].shortDescription}.</p>
                                <p>- John House, Renoir in the Barnes Foundation.</p>
                            </div>
                            <div className="card-footer">
                                <p>Albert Barnes taught people to look at works of art primarily in terms of their visual relationships.</p>
                                <p><small>Swipe for visually similar works</small></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5">
                    <LanguageSelect />
                </div>
                <div id="reset-experience" className="row mt-5 mb-3">
                    <div className="col-6 offset-3 text-center">
                        <span className="reset-experience" onClick={this.openModal}>Reset Experience</span>
                    </div>
                    <Modal
                        isOpen={this.state.modalIsOpen}
                        onRequestClose={this.closeModal}
                        contentLabel="Reset Experience Modal"
                        className="Modal"
                        overlayClassName="Overlay"
                    >
                        <div className="reset">
                            <div className="row">
                                <div className="col-12">
                                    <i className="fa fa-2x fa-angle-left pull-left"></i>
                                    <span className="dismiss" onClick={this.closeModal}>
                                        Cancel</span>
                                </div>
                            </div>
                            <div className="title">
                                <h1>You are about to reset the Snap experience.</h1>
                            </div>
                            <div className="message">We are using Google to help us automatically translate our text.</div>
                            <div className="row action">
                                <div className="col-6 offset-3 col-md-2 offset-md-5 text-center">
                                    <button className="btn snap-btn snap-btn-danger" onClick={this.resetExperience}>
                                        Reset
                                </button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>

                <Footer />
            </div>
        );
    }
}

export default SnapResults;