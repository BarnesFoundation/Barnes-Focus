import React, { Component } from 'react';
import { SNAP_USER_EMAIL } from './Constants';

class EmailFooter extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            errors: {
                email: false
            }
        }
    }

    handleEmailInput = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    validateEmail = () => {
        const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return this.state.email.length > 0 && emailRegex.test(this.state.email);
    }

    _saveEmail = () => {
        console.log('Save email called!!');
        if (!this.validateEmail()) {
            this.setState({ errors: { email: true } });
        }
        else {
            console.log('Valid email. Call backend API to save email.');
            const userEmail = this.state.email;
            this.setState({ email: '' });
            localStorage.setItem(SNAP_USER_EMAIL, userEmail);
            this.props.onSubmitEmail(userEmail);
        }
    }

    render() {
        let disclaimerTop = (this.props.isEmailScreen) ? ((this.state.errors.email) ? '365px' : '300px') : '0px';
        return (
            <div className="email-container">
                <div className="email-head h2">
                    {this.props.getTranslation('Bookmark_capture', 'text_1')}
                </div>
                <div className="email-input">
                    <form onSubmit={this.submitBookMark}>
                        <div className="input-group">
                            <input type="email" placeholder={this.props.getTranslation('Bookmark_capture', 'text_2')} className='form-control' name="email" value={this.state.email} onChange={this.handleEmailInput} />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" id="bookmark-submit" type="button" onClick={() => this._saveEmail()}>Save</button>
                            </div>
                        </div>
                        {
                            this.state.errors.email === true &&
                            <div className="email-input-error caption">
                                {this.props.getTranslation('Bookmark_capture', 'text_5')}
                            </div>
                        }
                    </form>
                </div>
                <div className="email-disclaimer small-paragraph" style={{ top: disclaimerTop }}>
                    {this.props.getTranslation('Bookmark_capture', 'text_3')}
                </div>
            </div>
        );
    }
}

export default EmailFooter;