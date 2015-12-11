import {Component} from 'react';
import {Modal, Button, Input} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {$} from 'zepto-browserify';

/**
 * File with basic App layout and routes
 */

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
    defaultMessage: 'Login'
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
  },
  loginError: {
    id: 'login.error',
    description: 'Login error message',
    defaultMessage: 'Wrong login or password'
  }
});

class Login extends Component {

  _bind (...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor (props) {
    super(props);
    this.state = {
      login: null,
      password: null,
      showModal: false
    };
    this._bind('close', 'open', '_login');
  }

  close () {
    this.setState({showModal: false});
  }

  open () {
    this.setState({showModal: true});
  }

  _login () {
    console.log('login');
    console.log(this.state);
  }

  render () {
    const {formatMessage} = this.props.intl;

    let loginButton = <Input type='text' value={this.state.login} placeholder={formatMessage(messages.hintLogin)} label={formatMessage(messages.fieldLogin)} ref="login"/>;
    let passwordButton = <Input type='password' value={this.state.password} placeholder={formatMessage(messages.hintPassword)} label={formatMessage(messages.fieldPassword)} ref="password"/>;

    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title><FormattedMessage {...messages.loginTitle}/></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loginButton}
          <br/>
          {passwordButton}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}><FormattedMessage {...messages.buttonClose}/></Button>
          <Button onClick={this._login} bsStyle='success'><FormattedMessage {...messages.buttonLogin}/></Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default injectIntl(Login);