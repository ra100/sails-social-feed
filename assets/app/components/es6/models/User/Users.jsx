import {Component, PropTypes} from 'react';
import {Col, Row, Grid, PageHeader, Table} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import Loading from './../../Loading';
import UserRow from './UserRow';
import _ from 'lodash/core';

const messages = defineMessages({
  usersTitle: {
    id: 'user.all.title',
    description: 'Page title for users overview',
    defaultMessage: 'Users'
  },
  name: {
    id: 'user.field.name.label',
    description: 'Table header name',
    defaultMessage: 'User'
  },
  email: {
    id: 'user.field.email.label',
    description: 'Table header email',
    defaultMessage: 'Email'
  },
  roles: {
    id: 'user.field.roles.label',
    description: 'Table header role',
    defaultMessage: 'Roles'
  },
  groups: {
    id: 'user.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
  action: {
    id: 'user.action',
    description: 'Table header action',
    defaultMessage: 'Action'
  }
});

class Users extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      users: null,
      status: 0,
      error: null,
      page: 0,
      perPage: 30
    };
    this._bind('_loadData', 'handleResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadData();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.socket.get('/users/unsubscribe');
    this.context.socket.get('/groups/unsubscribe');
    this.context.socket.get('/roles/unsubscribe');
  }

  handleResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.error) {
      this.setState({status: res.statusCode, error: res.body, users: null});
    } else {
      this.setState({status: res.statusCode, error: null, users: data});
    }
  }

  _loadData() {
    if (!this._isMounted) {
      return;
    }
    let {socket} = this.context;
    let query = {
      skip: this.state.page * this.state.perPage,
      populate: 'roles,groups'
    };
    socket.get('/users', query, this.handleResponse);
  }

  render() {
    const {formatMessage} = this.props.intl;

    switch (this.state.status) {
      case 403:
        return (<Forbidden/>);
        break;

      case 404:
        return (<NotFound/>);
        break;

      case 200:
        if (this.state.users !== null) {
          return (
            <Row>
              <PageHeader>
                <FormattedMessage {...messages.usersTitle}/>
              </PageHeader>
              <Col xs={12}>
                <Table striped hover condensed responsive>
                  <thead>
                    <tr>
                      <th><FormattedMessage {...messages.name}/></th>
                      <th><FormattedMessage {...messages.email}/></th>
                      <th><FormattedMessage {...messages.roles}/></th>
                      <th><FormattedMessage {...messages.groups}/></th>
                      <th><FormattedMessage {...messages.action}/></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.users.map(function (user, i) {
                      return <UserRow user={user} key={i}/>;
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          );
        }
        break;

      case 0:
        return (<Loading/>);
        break;

      default:
        return (<Error error={this.state.error}/>);
    }
  }
}

Users.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(Users);