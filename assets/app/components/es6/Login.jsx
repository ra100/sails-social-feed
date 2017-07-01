import {Component} from 'react'
import PropTypes from 'prop-types'
import {findDOMNode} from 'react-dom'
import {
  Modal,
  Button,
  FormControl,
  Alert,
  ControlLabel,
  FormGroup
} from 'react-bootstrap'
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl'
import 'jquery-browserify'
import _ from 'lodash/core'
import fp from 'lodash/fp'
import permissions from '../permissions'

/**
 * File with basic App layout and routes
 */
const ENTER = 13

const messages = defineMessages({
  loginTitle: {
    id: 'login.modal.title',
    description: 'Title of login popup',
    defaultMessage: 'Login'
  },
  buttonLogin: {
    id: 'login.button.title',
    description: 'Login button title',
    defaultMessage: 'Login'
  },
  buttonClose: {
    id: 'close.button.title',
    description: 'Close button title',
    defaultMessage: 'Close'
  },
  fieldLogin: {
    id: 'login.login.field',
    description: 'Username label',
    defaultMessage: 'Username'
  },
  hintLogin: {
    id: 'login.login.hint',
    description: 'Hint message for username',
    defaultMessage: 'Enter username or email'
  },
  fieldPassword: {
    id: 'login.password.field',
    description: 'Password label',
    defaultMessage: 'Password'
  },
  hintPassword: {
    id: 'login.password.hint',
    description: 'Password field placeholder',
    defaultMessage: 'Type password here'
  }
})

class Login extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      login: '',
      password: '',
      showModal: true,
      alert: '',
      alertVisible: false
    }
    this._bind('_login', '_handleLoginChange', '_handlePasswordChange', '_handleLoginKeyDown', '_handlePasswordKeyDown', '_processResponse')
  }

  _handleLoginChange(event) {
    let login = event.target.value
    this.setState({login: login})
  }

  _handlePasswordChange(event) {
    let password = event.target.value
    this.setState({password: password})
  }

  _handleLoginKeyDown(event) {
    if (event.keyCode == ENTER) {
      // this.refs.password.focus();
    }
  }

  _handlePasswordKeyDown(event) {
    if (event.keyCode == ENTER) {
      this._login()
    }
  }

  _login() {
    this.setState({alertVisible: false})
    if (this.state.login != null && this.state.password != null) {
      let _this = this
      let login = this.state.login
      let payload = {
        password: this.state.password,
        _csrf: this._csrf(),
        type: 'local',
        identifier: login
      }
      $.ajax({
        type: 'POST',
        url: '/auth/local',
        data: payload,
        success: function (data, status, xhr) {
          _this._processResponse(data)
        },
        error: function (data, status, xhr) {
          let message = JSON.parse(data.response)
        }
      })
    }
  }

  _processResponse(data) {
    let _self = this
    if (data.status == 'ok') {
      socket.get('/users/me', function (data, jwr) {
        let user = {}
        if (jwr.statusCode == 200) {
          user = data
          user.permissions = {}
          _.forEach(user.roles, function (v, k) {
            let perm = permissions[v.name]
            user.permissions = fp.merge(user.permissions, perm)
          })
          _self.context.user.setUser(user)
          _self.context.history.push('/')
        }
      })
    } else {
      if (data.error == 'Error.Passport.Already.Authenticated') {
        _self.context.history.push('/')
      } else {
        this.setState({alert: data.message, alertVisible: true})
      }
    }
  }

  _csrf() {
    return window._csrf
  }

  render() {
    const {formatMessage} = this.props.intl

    let loginButton = <FormGroup controlId="login">
      <ControlLabel>{formatMessage(messages.fieldLogin)}</ControlLabel>
      <FormControl type='text' value={this.state.login} placeholder={formatMessage(messages.hintLogin)} ref="login" onChange={this._handleLoginChange} onKeyDown={this._handleLoginKeyDown}/>
    </FormGroup>

    let passwordButton = <FormGroup controlId="password">
      <ControlLabel>{formatMessage(messages.fieldPassword)}</ControlLabel>
      <FormControl type='password' value={this.state.password} placeholder={formatMessage(messages.hintPassword)} ref="password" onChange={this._handlePasswordChange} onKeyDown={this._handlePasswordKeyDown}/>
      </FormGroup>

    let alert = null
    if (this.state.alertVisible) {
      alert = <Alert bsStyle="danger">{this.state.alert}</Alert>
    }

    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title><FormattedMessage {...messages.loginTitle}/></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loginButton}
            <br/> {passwordButton}
            {alert}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this._login} bsStyle='success' disabled={this.state.password.length === 0}><FormattedMessage {...messages.buttonLogin}/></Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    )
  }
}

Login.contextTypes = {
  user: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default injectIntl(Login)
