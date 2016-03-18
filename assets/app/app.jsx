var CONST_ES6_BUILD_PATH = './build/';

import React from 'react';
import {render} from 'react-dom';
import {createHistory, createHashHistory} from 'history';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {IntlProvider} from 'react-intl';
import socketIOClient from 'socket.io-client';
import sailsIOClient from 'sails.io.js';
import _ from 'lodash';
import Root from './build/Root';
import permissions from './permissions';
import 'jquery-browserify';
import 'arrive';
import 'bootstrap_material_design';
import 'ripples';

$(function () {
  $.material.init();
});

// load csrf token
window._csrf = $('meta[name="csrf-token"]').attr('content');
// prepare sails socket
let io = sailsIOClient(socketIOClient);
window.socket = io.socket;
// _csrf token refresh
socket.on('connect', function() {
  $.get('/csrfToken').success(function(data) {
    _csrf = data._csrf;
  });
});
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

var user = {
  setUser: function (u) {
    _.extend(this, u);
  },
  clearUser: function () {
    delete this.username;
    delete this.roles;
    delete this.permissions;
  }
};

// check login status
socket.get('/users/me', function (data, jwr) {
  if (jwr.statusCode == 200) {
    user.setUser(data);
    user.permissions = {};
    _.forEach(user.roles, function (v, k) {
      let perm = permissions[v.name];
      user.permissions = _.merge(user.permissions, perm);
    });
  }
  render(
    <IntlProvider locale={language} messages={langs[language].messages}>
    <Root history={history} user={user} socket={io.socket}/>
  </IntlProvider>, document.getElementById('app'));
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
