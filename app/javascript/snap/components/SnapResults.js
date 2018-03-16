import React, { Component } from 'react';

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
                result['artist'] = art_obj.people;
                result['classification'] = art_obj.classification;
                result['locations'] = art_obj.locations;
                result['medium'] = art_obj.medium;
                result['url'] = art_url
                result['invno'] = art_obj.invno;
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
            <div>
                <div className="row">
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
                            <p><strong>Artist:&nbsp;</strong> {this.state.searchResults[0].artist}</p>
                            <p><strong>Accession No.:&nbsp;</strong> {this.state.searchResults[0].invno}</p>
                            <p><strong>Classification:&nbsp;</strong> {this.state.searchResults[0].classification}</p>
                            <p><strong>Medium:&nbsp;</strong> {this.state.searchResults[0].medium}</p>
                            <p><strong>Location:&nbsp;</strong> {this.state.searchResults[0].locations}</p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default SnapResults;