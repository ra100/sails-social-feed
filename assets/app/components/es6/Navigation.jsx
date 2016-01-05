import {Component, PropTypes} from 'react';
import {LinkContainer} from 'react-router-bootstrap';
import {Button, Navbar, Nav, NavItem} from 'react-bootstrap';
import {FormattedMessage, defineMessages} from 'react-intl';
import {$} from 'zepto-browserify';

/**
 * App navbar
 */
const messages = defineMessages({
  // login: {
  //   id: 'login.button.title',
  //   description: 'Name on login button',
  //   defaultMessage: 'Login'
  // },
  appTitle: {
    id: 'app.title',
    description: 'Name of the application',
    defaultMessage: 'SocialFeed'
  },
  logout: {
    id: 'logout.button.title',
    description: 'Logout button title',
    defaultMessage: 'Logout'
  }
});

export default class Navigation extends Component {

  constructor (props) {
    super(props);
    this._logout = this._logout.bind(this);
  }

  _logout () {
    var _that = this;
    $.ajax({
      type: 'GET',
      url: '/logout',
      success: function (data, status, xhr) {
        _that.props.history.push('/login');
      },
      error: function (data, status, xhr) {
        let message = JSON.parse(data.response);
        console.log(message);
      }
    });
  }

  render () {
    // let login = <Login ref="loginForm"/>;
    // let loginButton = <NavItem eventKey={1} onTouchTap={this.openLogin.bind(this)}><FormattedMessage {...messages.login}/></NavItem>;
    let logoutButton = <NavItem eventKey={1} onTouchTap={this._logout.bind(this)}><FormattedMessage {...messages.logout}/></NavItem>;

    let navbar = <Navbar inverse>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#"><FormattedMessage {...messages.appTitle}/></a>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          {logoutButton}
        </Nav>
      </Navbar.Collapse>
    </Navbar>;
    return (
      <div>
        {navbar}
      </div>
    );
  }
}

Navigation.propTypes = {
  history: PropTypes.object.isRequired
};
