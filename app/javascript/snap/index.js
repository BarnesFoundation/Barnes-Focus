import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';

import AppRouter from './routes/AppRouter';

import 'bootstrap/scss/bootstrap.scss'
import 'font-awesome/scss/font-awesome.scss';
import 'slick-carousel/slick/slick.scss';
import 'slick-carousel/slick/slick-theme.scss';
import './styles/styles.scss';



ReactDOM.render(<AppRouter />, document.getElementById('app'));
