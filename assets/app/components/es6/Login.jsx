import {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import {Modal, Button, Input, Alert} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {$} from 'zepto-browserify';

/**
 * File with basic App layout and routes
 */
const ENTER = 13;

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
});

class Login extends Component {

  _bind (...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor (props, context) {
    super(props, context);
    this.state = {
      login: null,
      password: null,
      showModal: true,
      alert: '',
      alertVisible: false
    };
    this._bind('_login', '_handleLoginChange', '_handlePasswordChange', '_handleLoginKeyDown', '_handlePasswordKeyDown', '_processResponse');
  }

  _handleLoginChange () {
    let login = this.refs.login.getValue().trim();
    this.setState({login: login});
  }

  _handlePasswordChange () {
    let password = this.refs.password.getValue().trim();
    this.setState({password: password});
  }

  _handleLoginKeyDown (event) {
    if (event.keyCode == ENTER) {
      // this.refs.password.focus();
    }
  }

  _handlePasswordKeyDown (event) {
    if (event.keyCode == ENTER) {
      this._login();
    }
  }

  _login () {
    this.setState({alertVisible: false});
    if (this.state.login != null && this.state.password != null) {
      let _this = this;
      let login = this.state.login;
      let payload = {
        password: this.state.password,
        _csrf: this._csrf(),
        type: 'local',
        identifier: login
      };
      $.ajax({
        type: 'POST',
        url: '/auth/local',
        data: payload,
        success: function (data, status, xhr) {
          _this._processResponse(data);
        },
        error: function (data, status, xhr) {
          let message = JSON.parse(data.response);
          console.log(message);
        }
      });
    }
  }

  _processResponse (data) {
    if (data.status == 'ok') {
      this.context.history.push('/');
    } else {
      this.setState({alert: data.message, alertVisible: true});
    }
  }

  _csrf () {
    return window._csrf;
  }

  render () {
    const {formatMessage} = this.props.intl;

    let loginButton = <Input type='text' value={this.state.login} placeholder={formatMessage(messages.hintLogin)} label={formatMessage(messages.fieldLogin)} ref="login" onChange={this._handleLoginChange} onKeyDown={this._handleLoginKeyDown}/>;
    let passwordButton = <Input type='password' value={this.state.password} placeholder={formatMessage(messages.hintPassword)} label={formatMessage(messages.fieldPassword)} ref="password" onChange={this._handlePasswordChange} onKeyDown={this._handlePasswordKeyDown}/>;
    let alert = null;
    if (this.state.alertVisible) {
      alert = <Alert bsStyle="danger">{this.state.alert}</Alert>;
    }

    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title><FormattedMessage {...messages.loginTitle}/></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loginButton}
            <br/>
            {passwordButton}
            {alert}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this._login} bsStyle='success'><FormattedMessage {...messages.buttonLogin}/></Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    );
  }
}
Login.contextTypes = {
  history: PropTypes.object.isRequired
};
// LoginIntl.contextTypes = {
//   history: PropTypes.object.isRequired
// };
export default injectIntl(Login);
