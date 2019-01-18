import React, { Component } from 'react';
import { BrowserRouter, Route, NavLink, Switch } from 'react-router-dom';

import Home from '../components/Home';
import Camera from '../components/Camera';
import SnapResults from '../components/SnapResults';
import * as constants from '../components/Constants';

class AppRouter extends Component {

    constructor(props) {
        super(props);

        this.state = {
            intervalId: null
        }
    }

    defaultResetIfSessionAlive = () => {
        console.log('App reset interval lapsed. App will now reset.');
        localStorage.removeItem(constants.SNAP_LANGUAGE_PREFERENCE);
        localStorage.removeItem(constants.SNAP_USER_EMAIL);
        localStorage.removeItem(constants.SNAP_ATTEMPTS);
    }

    componentDidMount() {
        var intervalId = setInterval(this.defaultResetIfSessionAlive, constants.SNAP_APP_RESET_INTERVAL);
        // store intervalId in the state so it can be accessed later:
        this.setState({ intervalId: intervalId });
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        clearInterval(this.state.intervalId);
    }

    render() {
        return (
            <BrowserRouter>
                <div>
                    <Switch>
                        <Route path="/" component={Home} exact={true} key="home" />
                        <Route path="/scan" component={Camera} exact={true} key="scan" />
                        <Route path="/artwork/:imageId?" component={SnapResults} key="artwork" />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

}

export default AppRouter;