import {Component, PropTypes} from 'react';
import {LinkContainer} from 'react-router-bootstrap';
import {
  Button,
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {$} from 'zepto-browserify';
import _ from 'lodash';

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
  },
  create: {
    id: 'menu.create.title',
    description: 'Create button',
    defaultMessage: 'Create'
  },
  stream: {
    id: 'menu.stream.title',
    description: 'Create Stream button',
    defaultMessage: 'Stream'
  }
});

class Navigation extends Component {

  constructor (props, context) {
    super(props, context);
    this._logout = this._logout.bind(this);
  }

  _logout () {
    var _self = this;
    $.ajax({
      type: 'GET',
      url: '/logout',
      success: function (data, status, xhr) {
        _self.context.user.clearUser();
        _self.context.history.push('/login');
      },
      error: function (data, status, xhr) {
        let message = JSON.parse(data.response);
        console.log(message);
      }
    });
  }

  render () {
    const {formatMessage} = this.props.intl;
    const {permissions} = this.context.user;

    let logoutButton = <NavItem eventKey={1} onTouchTap={this._logout.bind(this)}><FormattedMessage {...messages.logout}/></NavItem>;

    let createMenu = null;
    if (permissions) {
      if (_.indexOf(permissions.stream.own, 'c') >= 0) {
        let createStream = <LinkContainer to={'/create/stream'}>
          <MenuItem>
            <FormattedMessage {...messages.stream}/>
          </MenuItem>
        </LinkContainer>;

        createMenu = <NavDropdown id="create-dropdown" title={formatMessage(messages.create)}>
          {createStream}
        </NavDropdown>;
      }
    }

    let navbar = <Navbar inverse>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#"><FormattedMessage {...messages.appTitle}/></a>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullLeft>
          {createMenu}
        </Nav>
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

Navigation.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export default injectIntl(Navigation);
