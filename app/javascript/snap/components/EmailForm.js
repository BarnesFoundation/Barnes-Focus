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
                <div className="email-head">
                    To receive all the artworks you are seeing today, please enter your email address.
                </div>
                <div className="email-input">
                    <form onSubmit={this.submitBookMark}>

                        <div className="input-group">
                            <input type="email" placeholder="Email address" className='form-control' name="email" value={this.state.email} onChange={this.handleEmailInput} />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button" onClick={() => this._saveEmail()}>Save</button>
                            </div>
                        </div>
                        {
                            this.state.errors.email === true &&
                            <div className="email-input-error">
                                Something doesn’t look right. Try entering your email again.
                            </div>
                        }


                    </form>
                </div>
                <div className="email-disclaimer" style={{ top: disclaimerTop }}>
                    We will only use your email to send you the links to the works you've seen. You won't be joined to any other list.
                </div>
            </div>
        );
    }
}

export default EmailFooter;