import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LanguageSelect from '../components/LanguageSelect';
import share from 'images/share_icon.svg';
import bookmark from 'images/bookmark_icon.svg';
import icon_camera from 'images/camera_icon.svg';
import Footer from './Footer';

/** 
 * withHeader HOC provides props with location, history and match objects
*/
class SnapResults extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props.location.state,
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
                                    <span><img src={bookmark} alt="share" />Bookmark it</span>
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
                <div className="row mt-5 mb-3">
                    <div className="col-6 offset-3 text-center">
                        <span className="reset-experience">Reset Experience</span>
                    </div>
                </div>
                <Footer />


                {/* <div className="row">
                    {this.state.searchResults.length > 0 &&
                        <a className="image-url col-sm-12" href={this.state.searchedImageURL} target="_blank">
                            <img src={this.state.searchResults[0].url} alt="result" className="img-thumbnail" />
                        </a>
                    }
                    {this.state.error &&
                        <div className="col-sm-12">
                            <p>No results found!</p>
                        </div>
                    }
                </div>
                {
                    this.state.searchResults.length > 0 &&
                    <div className="row">
                        <div className="results col-sm-12">
                            <p><strong>Title:&nbsp;</strong> {this.state.searchResults[0].title}</p>
                            <p><strong>Short Description:&nbsp;</strong> {this.state.searchResults[0].shortDescription}</p>
                            <p><strong>Artist:&nbsp;</strong> {this.state.searchResults[0].artist}</p>
                            <p><strong>Accession No.:&nbsp;</strong> {this.state.searchResults[0].invno}</p>
                            <p><strong>Classification:&nbsp;</strong> {this.state.searchResults[0].classification}</p>
                            <p><strong>Medium:&nbsp;</strong> {this.state.searchResults[0].medium}</p>
                            <p><strong>Location:&nbsp;</strong> {this.state.searchResults[0].locations}</p>
                        </div>
                    </div>
                } */}
            </div>
        );
    }
}

export default SnapResults;