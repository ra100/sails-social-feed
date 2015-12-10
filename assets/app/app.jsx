var CONST_ES6_BUILD_PATH = './build/';

//var _  = require('lodash');
import React from 'react';
import {render} from 'react-dom';
import {Router, Route} from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {LinkContainer} from 'react-router-bootstrap';
import socketIOClient from 'socket.io-client';
import {IntlProvider} from 'react-intl';
let io = require('sails.io.js')(socketIOClient);

import Home from './build/Home';

// load csrf token
// window._csrf = $('meta[name="csrf-token"]').attr('content');
// let _csrf = $('meta[name="csrf-token"]').attr('content');

io.connect();

window.io = io;
window.React = React;

let language = readCookie('language');
let langs = {
  en: require('./locales/en'),
  cs: require('./locales/cs')
};
if (language == '' || langs[language] == undefined) {
  language = 'en';
}

injectTapEventPlugin();

render(
  <IntlProvider
    locale = {language}
    messages = {
      langs[language].messages
    }>
    <Router>
      <Route path="/" component={Home}>
      </Route>
    </Router>
  </IntlProvider>,
  document.getElementById('app')
);

/**
 * Read cookie value
 * @param  {string} name cookie name
 * @return {string}      cookie value
 */
function readCookie(name) {
  name = name.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  var regex = new RegExp('(?:^|;)\\s?' + name + '=(.*?)(?:;|$)', 'i'),
    match = document.cookie.match(regex);
  return match && unescape(match[1]);
}
