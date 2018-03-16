import React from 'react';
import { BrowserRouter, Route, NavLink, Switch } from 'react-router-dom';

import Header from '../components/Header';
import Welcome from '../components/Welcome'
import Camera from '../components/Camera';
import SnapResults from '../components/SnapResults';


const AppRouter = () => (
    <BrowserRouter>
        <div>
            <Header />
            <Switch>
                <Route path="/" component={Welcome} exact={true} />
                <Route path="/snap" component={Camera} exact={true} />
                <Route path="/results" component={SnapResults} exact={true} />
            </Switch>
        </div>
    </BrowserRouter>
);


export default AppRouter;