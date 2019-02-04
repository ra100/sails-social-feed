import React from 'react'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { IntlProvider } from 'react-intl'
import socketIOClient from 'socket.io-client'
import sailsIOClient from 'sails.io.js'
import axios from 'axios'
import extend from 'lodash/extend'
import 'jquery-browserify'
import 'arrive'
import 'bootstrap_material_design'
import 'ripples'

import App from './build/App'
import permissions from './permissions'

const request = axios.create({ withCredentials: true })

window.$(function() {
  window.$.material.init()
})

// load csrf token
window._csrf = window.$('meta[name="csrf-token"]').attr('content')
// prepare sails socket
const io = sailsIOClient(socketIOClient)
window.socket = io.socket
// _csrf token refresh
window.socket.on('connect', () => {
  request
    .get('/csrfToken')
    .then(response => {
      window._csrf = response.data._csrf
    })
    .catch(console.error) // eslint-disable-line no-console
})

let language = readCookie('language')
let langs = {
  en: require('./locales/en'),
  cs: require('./locales/cs')
}
if (language == '' || langs[language] == undefined) {
  language = 'en'
}

const history = createHashHistory()

const user = {
  setUser: function(u) {
    extend(this, u)
  },
  clearUser: function() {
    delete this.username
    delete this.roles
    delete this.permissions
  }
}

// check login status
window.socket.get('/users/me', function(data, jwr) {
  if (jwr.statusCode == 200) {
    user.setUser(data)
    user.permissions = {}
    user.roles.forEach(v => {
      user.permissions = window.$.extend(true, user.permissions, permissions[v.name])
    })
  }
  if (jwr.statusCode == 403) {
    history.push('/login')
  }
})

ReactDOM.render(
  <IntlProvider locale={language} messages={langs[language].messages}>
    <App history={history} user={user} socket={io.socket} />
  </IntlProvider>,
  document.getElementById('app')
)

/**
 * Read cookie value
 * @param  {string} name cookie name
 * @return {string}      cookie value
 */
function readCookie(name) {
  name = name.replace(
    /([.*+?^=!:${}()|[\]/\\])/g,
    /([.*+?^=!:${}()|[\]/\\])/g,
    /([.*+?^=!:${}()|[\]/\\])/g,
    /([.*+?^=!:${}()|[\]/\\])/g,
    '\\$1'
  )
  var regex = new RegExp('(?:^|;)\\s?' + name + '=(.*?)(?:;|$)', 'i'),
    match = document.cookie.match(regex)
  return match && unescape(match[1])
}
