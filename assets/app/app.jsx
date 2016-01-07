var CONST_ES6_BUILD_PATH = './build/';

import React from 'react';
import {render} from 'react-dom';
import {createHistory, createHashHistory } from 'history';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {IntlProvider} from 'react-intl';
import {$} from 'zepto-browserify';
import socketIOClient from 'socket.io-client';
import sailsIOClient from 'sails.io.js';
import Root from './build/Root';


// load csrf token
window._csrf = $('meta[name="csrf-token"]').attr('content');
// prepare sails socket
let io = sailsIOClient(socketIOClient);
window.socket = io.sails.connect();
// debug
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

const history = createHashHistory();

// check login status
socket.get('/users/me', function(data, jwr) {
  let user = data ? data : {};
  render(
    <IntlProvider locale={language} messages={langs[language].messages}>
      <Root history={history} user={user}/>
    </IntlProvider>,
  document.getElementById('app'));
  if (jwr.statusCode == 403) {
    history.push('/login');
  }
});

/**
* Read cookie value
* @param  {string} name cookie name
* @return {string}      cookie value
*/
function readCookie(name) {
  name = name.replace(/([.*+?^=!:${}()|[\]\/\\])/g, /([.*+?^=!:${}()|[\]\/\\])/g, /([.*+?^=!:${}()|[\]\/\\])/g, /([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  var regex = new RegExp('(?:^|;)\\s?' + name + '=(.*?)(?:;|$)', 'i'),
    match = document.cookie.match(regex);
  return match && unescape(match[1]);
}
