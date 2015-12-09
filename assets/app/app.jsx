var CONST_ES6_BUILD_PATH = './build/';

//var _  = require('lodash');
import React from 'react';
import {render} from 'react-dom';
import {Router, Route} from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {LinkContainer} from 'react-router-bootstrap';
import socketIOClient from 'socket.io-client';
let io = require('sails.io.js')(socketIOClient);

import Home from './build/Home';

io.connect();

window.React = React;

injectTapEventPlugin();

render(
  <Router>
    <Route path="/" component={Home}>
    </Route>
  </Router>, document.getElementById('app')
);