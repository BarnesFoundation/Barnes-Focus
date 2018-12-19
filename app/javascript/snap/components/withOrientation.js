
import React from 'react';
import landscape_bg from 'images/barnes-landscape-background.png';

const withOrientation = WrappedComponent =>
    class WithOrientation extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                orientationSupported: true
            }
        }

        componentDidMount() {
            if ('orientation' in screen) {
                screen.orientation.addEventListener('change', (e) => {
                    console.log('current orientation :: ' + screen.orientation.type);
                    if (screen.orientation.type !== 'portrait-primary') {
                        this.setState({ orientationSupported: false });
                    } else {
                        this.setState({ orientationSupported: true });
                    }
                });
            } else {
                console.log('Orientation API not supported');
            }
        }

        render() {
            return (
                <div>
                    {
                        this.state.orientationSupported &&
                        <WrappedComponent {...this.props} />
                    }
                    {
                        !this.state.orientationSupported &&
                        <div className="home-wrapper" id="home-wrapper">
                            <img src={landscape_bg} alt="landscape_bg" style={{ width: screen.width, height: screen.height }} />
                            <div className="app-usage-alert">
                                <div className="app-usage-msg">
                                    This app is best viewed in Portrait mode.
                                </div>
                            </div>
                        </div>
                    }
                </div>
            )
        }
    }

export default withOrientation;