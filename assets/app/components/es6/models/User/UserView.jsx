import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Button,
  PageHeader,
  Alert,
  Label
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import Error from './../../Error';
import Loading from './../../Loading';
import EditToolbar from './../../EditToolbar';
import _ from 'lodash';

const messages = defineMessages({
  userFieldEmailLabel: {
    id: 'user.field.email.label',
    description: 'User Email label',
    defaultMessage: 'Email'
  },
  userFieldRolesLabel: {
    id: 'user.field.roles.label',
    description: 'User Role label',
    defaultMessage: 'Roles'
  },
  userFieldGroupsLabel: {
    id: 'user.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
});

class UserView extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      user: null,
      status: 0,
      error: null
    };
    this._bind('_edit', 'handleResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    let {socket} = this.context;
    let query = {
      populate: 'roles,passports,streams,feeds,groups'
    };
    socket.get('/users/' + this.props.params.userId, query, this.handleResponse);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.error) {
      this.setState({status: res.statusCode, error: res.body, user: null});
    } else {
      this.setState({status: res.statusCode, error: null, user: data});
    }
  }

  _edit() {
    this.props.history.push('/user/' + this.state.user.id + '/edit');
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
        if (this.state.user !== null) {
          let {user} = this.state;
          return (
            <Row>
              <PageHeader>
                {user.username}
              </PageHeader>
              <Col xs={3}><FormattedMessage {...messages.userFieldEmailLabel}/></Col>
              <Col xs={9}>
                <strong>{user.email}</strong>
              </Col>
              <Col xs={3}><FormattedMessage {...messages.userFieldRolesLabel}/></Col>
              <Col xs={9}>
                {user.roles.map(function (role, i) {
                  return <Label key={i}>{role.name}</Label>;
                })}
              </Col>
              <Col xs={3}><FormattedMessage {...messages.userFieldGroupsLabel}/></Col>
              <Col xs={9}>
                {user.groups.map(function (group, i) {
                  return <Label key={i}>{group.name}</Label>;
                })}
              </Col>
              <EditToolbar edit={this._edit}/>
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

UserView.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(UserView);