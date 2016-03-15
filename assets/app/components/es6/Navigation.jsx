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
  login: {
    id: 'login.button.title',
    description: 'Name on login button',
    defaultMessage: 'Login'
  },
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
  },
  feed: {
    id: 'menu.feed.title',
    description: 'Create Feed button',
    defaultMessage: 'Feed'
  },
  group: {
    id: 'menu.group.title',
    description: 'Create Group button',
    defaultMessage: 'Group'
  },
  view: {
    id: 'menu.view.title',
    description: 'View button',
    defaultMessage: 'View'
  },
  groups: {
    id: 'menu.groups.title',
    description: 'View Groups button',
    defaultMessage: 'Groups'
  }
});

class Navigation extends Component {

  constructor(props, context) {
    super(props, context);
    this._logout = this._logout.bind(this);
  }

  _logout() {
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

  render() {
    const {formatMessage} = this.props.intl;
    const {permissions} = this.context.user;

    let logoutButton = <NavItem eventKey={1} onTouchTap={this._logout.bind(this)}><FormattedMessage {...messages.logout}/></NavItem>;

    if (this.context.user.username == undefined) {
      logoutButton = <LinkContainer to={'/login'}>
        <NavItem><FormattedMessage {...messages.login}/></NavItem>
      </LinkContainer>;
    }

    let createMenu = null;
    let viewMenu = null;
    if (permissions) {
      if (_.indexOf(permissions.stream.own, 'c') >= 0) {
        let createStream = <LinkContainer to={'/create/stream'}>
          <MenuItem>
            <FormattedMessage {...messages.stream}/>
          </MenuItem>
        </LinkContainer>;

        let createFeed = null;
        if (_.indexOf(permissions.feed.own, 'c') >= 0) {
          createFeed = <LinkContainer to={'/create/feed'}>
            <MenuItem>
              <FormattedMessage {...messages.feed}/>
            </MenuItem>
          </LinkContainer>;
        };

        let createGroup = null;
        if (_.indexOf(permissions.group.all, 'c') >= 0) {
          createGroup = <LinkContainer to={'/create/group'}>
            <MenuItem>
              <FormattedMessage {...messages.group}/>
            </MenuItem>
          </LinkContainer>;
        };

        createMenu = <NavDropdown id="create-dropdown" title={formatMessage(messages.create)}>
          {createStream}
          {createFeed}
          <MenuItem divider/> {createGroup}
        </NavDropdown>;

        let viewGroups = null;
        if (_.indexOf(permissions.group.all, 'r') >= 0) {
          viewGroups = <LinkContainer to={'/groups'}>
            <MenuItem>
              <FormattedMessage {...messages.groups}/>
            </MenuItem>
          </LinkContainer>;
        };

        viewMenu = <NavDropdown id="create-dropdown" title={formatMessage(messages.view)}>
          {viewGroups}
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
          {viewMenu}
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
