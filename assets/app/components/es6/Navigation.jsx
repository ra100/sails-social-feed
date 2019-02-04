import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {LinkContainer} from 'react-router-bootstrap'
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem
} from 'react-bootstrap'
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl'

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
  user: {
    id: 'menu.user.title',
    description: 'Create User button',
    defaultMessage: 'User'
  },
  view: {
    id: 'menu.view.title',
    description: 'View button',
    defaultMessage: 'View'
  },
  streams: {
    id: 'menu.streams.title',
    description: 'View Streams button',
    defaultMessage: 'Streams'
  },
  groups: {
    id: 'menu.groups.title',
    description: 'View Groups button',
    defaultMessage: 'Groups'
  },
  users: {
    id: 'menu.users.title',
    description: 'View Users button',
    defaultMessage: 'Users'
  }
})

class Navigation extends Component {

  constructor(props, context) {
    super(props, context)
    this._logout = this._logout.bind(this)
  }

  _logout() {
    this.context.socket.get('/logout', (data, res) => {
      if (res.statusCode == 200 || res.statusCode == 302) {
        this.context.user.clearUser()
        this.props.history.push('/login')
      } else {
        console.error(res)
      }
    })
  }

  render() {
    const {formatMessage} = this.props.intl
    const {permissions} = this.context.user

    let logoutButton = <NavItem eventKey={1} onClick={this._logout.bind(this)}><FormattedMessage {...messages.logout}/></NavItem>

    if (this.context.user.username == undefined) {
      logoutButton = <LinkContainer to={'/login'}>
        <NavItem><FormattedMessage {...messages.login}/></NavItem>
      </LinkContainer>
    }

    let createMenu = null
    let viewStreams = null
    let viewGroups = null
    let viewUsers = null
    if (permissions) {
      if (permissions.stream && permissions.stream.own.c) {
        let createStream = <LinkContainer to={'/create/stream'}>
          <MenuItem>
            <FormattedMessage {...messages.stream}/>
          </MenuItem>
        </LinkContainer>

        let createFeed = null
        if (permissions.feed && permissions.feed.own.c) {
          createFeed = <LinkContainer to={'/create/feed'}>
            <MenuItem>
              <FormattedMessage {...messages.feed}/>
            </MenuItem>
          </LinkContainer>
        };

        let createGroup = null
        if (permissions.group && permissions.group.all.c) {
          createGroup = <LinkContainer to={'/create/group'}>
            <MenuItem>
              <FormattedMessage {...messages.group}/>
            </MenuItem>
          </LinkContainer>
        };

        let createUser = null
        if (permissions.user && permissions.user.all.c) {
          createUser = <LinkContainer to={'/create/user'}>
            <MenuItem>
              <FormattedMessage {...messages.user}/>
            </MenuItem>
          </LinkContainer>
        };

        createMenu = <NavDropdown id="create-dropdown" title={formatMessage(messages.create)}>
          {createStream}
          {createFeed}
          <MenuItem divider/> {createGroup}
          {createUser}
        </NavDropdown>

        if (permissions.stream && permissions.stream.own.r) {
          viewStreams = <LinkContainer to={'/streams'}>
            <MenuItem>
              <FormattedMessage {...messages.streams}/>
            </MenuItem>
          </LinkContainer>
        };

        if (permissions.group && permissions.group.own.r) {
          viewGroups = <LinkContainer to={'/groups'}>
            <MenuItem>
              <FormattedMessage {...messages.groups}/>
            </MenuItem>
          </LinkContainer>
        };

        if (permissions.user && permissions.user.own.r) {
          viewUsers = <LinkContainer to={'/users'}>
            <MenuItem>
              <FormattedMessage {...messages.users}/>
            </MenuItem>
          </LinkContainer>
        };
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
          {viewStreams}
          {viewUsers}
          {viewGroups}
        </Nav>
        <Nav pullRight>
          {logoutButton}
        </Nav>
      </Navbar.Collapse>
    </Navbar>

    return (
      <div>
        {navbar}
      </div>
    )
  }
}

Navigation.contextTypes = {
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

export default injectIntl(Navigation)
