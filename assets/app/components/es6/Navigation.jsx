import {Component} from 'react';
import {LinkContainer} from 'react-router-bootstrap';
import {Button, Navbar, Nav, NavItem} from 'react-bootstrap';
import {FormattedMessage, defineMessages} from 'react-intl';
import Login from './Login';

/**
 * App navbar
 */

const messages = defineMessages({
  login: {
    id: 'login.button.title',
    description: 'Name on login button',
    defaultMessage: 'Login'
  },
  appTitle: {
    id: 'app.title',
    description: 'Name of the application',
    defaultMessage: 'SocialFeed'
  }
});

class Navigation extends Component {

  openLogin () {
    this.refs.loginForm.refs.wrappedElement.open();
  }

  render () {
    let login = <Login ref="loginForm"/>;
    let loginButton = <NavItem eventKey={1} onTouchTap={this.openLogin.bind(this)}><FormattedMessage {...messages.login}/></NavItem>;

    let navbar = <Navbar inverse>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#"><FormattedMessage {...messages.appTitle}/></a>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          {loginButton}
        </Nav>
      </Navbar.Collapse>
    </Navbar>;
    return (
      <div>
        {navbar}
        {login}
      </div>
    );
  }
}

module.exports = Navigation;
