import React, { Component } from 'react';

/** 
 * withHeader HOC provides props with location, history and match objects
*/
class SnapResults extends Component {

    constructor(props) {
        super(props);
        this.state = props.location.state
    }

    render() {
        return (
            <div>
                <div className="row">
                    {this.state.searchResults.length > 0 &&
                        <a className="image-url col-sm-12" href={this.state.searchedImageURL} target="_blank">
                            <img src={this.state.searchedImageURL} alt="result" className="img-thumbnail" />
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
                            <p><strong>Artist:&nbsp;</strong> {this.state.searchResults[0].artist}</p>
                            <p><strong>Accession No.:&nbsp;</strong> {this.state.searchResults[0].invno}</p>
                            <p><strong>Classification:&nbsp;</strong> {this.state.searchResults[0].classification}</p>
                            <p><strong>Medium:&nbsp;</strong> {this.state.searchResults[0].medium}</p>
                            <p><strong>Location:&nbsp;</strong> {this.state.searchResults[0].locations}</p>
                        </div>
                    </div>
                }
                <div className="row">
                    {
                        this.state.pastecResults.length > 0 &&
                        <div className="pastec-data">
                            <p><strong>PASTEC DATA</strong></p>
                            {this.state.pastecResults.map(function (img, index) {
                                return <div key={'mykey' + index}><p><strong>Image Idetifier:&nbsp;</strong> {img['image_id']}</p>
                                    <a className="image-url col-sm-12" href={img['image_url']} target="_blank">
                                        <img src={img['image_url']} alt="result" className="img-thumbnail" />
                                    </a>
                                </div>;
                            })}
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default SnapResults;