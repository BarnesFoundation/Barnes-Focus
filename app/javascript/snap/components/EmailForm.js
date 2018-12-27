import React, { Component } from 'react';

class EmailFooter extends Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: {
                email: false
            }
        }
    }

    render() {
        return (
            <div className="email-container">
                <div className="email-head">
                    Enter your e-mail address to receive all the artworks you are scanning today
                </div>
                <div className="email-input">
                    <form onSubmit={this.submitBookMark}>

                        <div className="input-group">
                            <input type="email" placeholder="Email address" className={this.state.errors.email ? 'error form-control' : 'form-control'} name="email" value={this.state.email} onChange={this.handleBookmarkFormInputChange} />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button">Save</button>
                            </div>
                        </div>

                    </form>
                </div>
                <div className="email-disclaimer">
                    <span>We will use your e-mail address only to send you the artworks you are scanning today.</span>
                </div>
            </div>
        );
    }
}

export default EmailFooter;