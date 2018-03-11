import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';

import AppRouter from './routes/AppRouter';

//import 'normalize.css/normalize.css';
import 'bootstrap/scss/bootstrap.scss'
import 'react-select/dist/react-select.css';
import './styles/styles.scss';



ReactDOM.render(<AppRouter />, document.getElementById('app'));
