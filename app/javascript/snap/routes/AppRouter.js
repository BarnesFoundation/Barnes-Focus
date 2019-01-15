import React, { Component } from 'react';
import { BrowserRouter, Route, NavLink, Switch } from 'react-router-dom';

import Home from '../components/Home';
import Camera from '../components/Camera';
import SnapResults from '../components/SnapResults';
import SnapNotFound from '../components/SnapNotFound';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_USER_EMAIL, SNAP_ATTEMPTS, SNAP_APP_RESET_INTERVAL } from '../components/Constants';

class AppRouter extends Component {

    constructor(props) {
        super(props);

        this.state = {
            intervalId: null
        }
    }

    defaultResetIfSessionAlive = () => {
        console.log('App reset interval lapsed. App will now reset.');
        localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
        localStorage.removeItem(SNAP_USER_EMAIL);
        localStorage.removeItem(SNAP_ATTEMPTS);
    }

    componentDidMount() {
        var intervalId = setInterval(this.defaultResetIfSessionAlive, SNAP_APP_RESET_INTERVAL);
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
                        <Route path="/" component={Home} exact={true} />
                        <Route path="/scan" component={Camera} exact={true} />
                        <Route path="/results/:imageId?" component={SnapResults} />
                        <Route path="/not-found" component={SnapNotFound} exact={true} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

}

export default AppRouter;