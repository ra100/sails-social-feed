import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader,
  ButtonToolbar,
  Alert
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import EditToolbar from './../../EditToolbar';
import {notify} from 'react-notify-toast';
import Multiselect from 'react-bootstrap-multiselect';
import _ from 'lodash';

const messages = defineMessages({
  userTitle: {
    id: 'user.new.title',
    description: 'Title of Create user page',
    defaultMessage: 'Create New User'
  },
  userEditTitle: {
    id: 'user.edit.title',
    description: 'Title of Edit user page',
    defaultMessage: 'Edit User'
  },
  userFieldNamePlaceholder: {
    id: 'user.field.name.placeholder',
    description: 'User Name placeholder',
    defaultMessage: 'UserName'
  },
  userFieldNameLabel: {
    id: 'user.field.name.label',
    description: 'User Name label',
    defaultMessage: 'Username'
  },
  userFieldEmailPlaceholder: {
    id: 'user.field.email.placeholder',
    description: 'User Email placeholder',
    defaultMessage: 'name@email.com'
  },
  userFieldEmailLabel: {
    id: 'user.field.email.label',
    description: 'User Email label',
    defaultMessage: 'Email'
  },
  userFieldPasswordPlaceholder: {
    id: 'user.field.password.placeholder',
    description: 'User Name placeholder',
    defaultMessage: '******'
  },
  userFieldPasswordLabel: {
    id: 'user.field.password.label',
    description: 'User Name label',
    defaultMessage: 'Password'
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
  saved: {
    id: 'user.saved.notify',
    description: 'Saved user notification',
    defaultMessage: 'User has been saved'
  }
});

const getSelected = function (data) {
  let i;
  let selected = [];
  for (i in data) {
    if (data[i].selected) {
      selected.push(data[i].value);
    }
  }
  return selected;
};

class UserEdit extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      bsStyle_username: null,
      bsStyle_groups: null,
      bsStyle_roles: null,
      bsStyle_password: null,
      bsStyle_email: null,

      username: null,
      groups: null,
      roles: null,
      password: null,
      email: null,

      user: null,
      edit: false,
      error: null,
      allow: true
    };
    this._bind('_save', '_update', '_remove', '_handleNameChange', '_handleEmailChange', '_handlePasswordChange', '_validateAll', '_handleRolesChange', '_handleGroupsChange', 'handleSaveResponse', 'handleCanCreate', 'handleCanModify', 'handleLoad', 'handleRoles', 'handleGroups');
  }

  componentDidMount() {
    this._isMounted = true;
    let {socket} = this.context;
    socket.get('/roles', {
      populate: 'none'
    }, this.handleRoles);
    socket.get('/groups', {
      populate: 'none',
      sort: 'name'
    }, this.handleGroups);
    if (this.props.params.userId >= 0) {
      socket.get('/users/canmodify/' + this.props.params.userId, this.handleCanModify);
    } else {
      socket.get('/users/cancreate', this.handleCanCreate);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleCanCreate(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({allow: true});
    } else {
      this.setState({allow: false});
    }
  }

  handleCanModify(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({allow: true, edit: true});
      let {socket} = this.context;
      socket.get('/users/' + this.props.params.userId, this.handleLoad);
    } else {
      this.setState({allow: false});
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      let i;
      let roles = [];
      let groups = [];
      if (this.state.roles == null) {
        for (i in data.roles) {
          roles.push({value: data.roles[i].id, label: data.roles[i].name, selected: true});
        }
      } else {
        roles = this.state.roles;
        for (i in data.roles) {
          let j;
          for (j in roles) {
            if (roles[j].value == data.roles[i].id) {
              roles[j].selected = true;
            };
          }
        }
      }
      if (this.state.groups == null) {
        for (i in data.groups) {
          groups.push({value: data.groups[i].id, label: data.groups[i].name, selected: true});
        }
      } else {
        groups = this.state.groups;
        for (i in data.groups) {
          let j;
          for (j in groups) {
            if (groups[j].value == data.groups[i].id) {
              groups[j].selected = true;
            };
          }
        }
      }
      this.setState({
        status: res.statusCode,
        user: data,
        username: data.username,
        email: data.email,
        roles: roles,
        groups: groups,
        error: null,
        edit: true
      });
      this.refs.roles.syncData();
      this.refs.groups.syncData();
    } else {
      this.setState({status: res.statusCode, error: res.body, user: null});
    }
  }

  handleRoles(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return;
    }
    let selected = getSelected(this.state.roles);
    let roles = [];
    let i;
    for (i in data) {
      let role = data[i];
      roles.push({
        value: role.id,
        label: role.name,
        selected: (_.indexOf(selected, role.id) > -1)
      });
    }
    this.setState({roles: roles});
    this.refs.roles.syncData();
  }

  handleGroups(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return;
    }
    let selected = getSelected(this.state.groups);
    let groups = [];
    let i;
    for (i in data) {
      let group = data[i];
      groups.push({
        value: group.id,
        label: group.name,
        selected: (_.indexOf(selected, group.id) > -1)
      });
    }
    this.setState({groups: groups});
    this.refs.groups.syncData();
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/users/create', {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
        roles: getSelected(this.state.roles),
        groups: getSelected(this.state.groups),
        _csrf: _csrf
      }, this.handleSaveResponse);
    }
  }

  _update() {
    let {socket} = this.context;
    if (this._validateAll()) {
      let payload =  {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
        _csrf: _csrf
      };
      if (this.context.user.permissions.user.all.u) {
        payload.roles = getSelected(this.state.roles);
      }
      if (this.context.user.permissions.user.all.u) {
        payload.groups = getSelected(this.state.groups);
      }
      socket.post('/users/update/' + this.props.params.userId, payload, this.handleSaveResponse);
    }
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.post('/users/destroy/' + this.props.params.userId, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  handleDestroyResponse(data, res) {
    const {formatMessage} = this.props.intl;
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true});
      notify.show(formatMessage(messages.deletedSuccess), 'success');
      this.props.history.goBack();
    } else {
      notify.show(res.body, 'error');
    }
  }

  handleSaveResponse(data, res) {
    const {formatMessage} = this.props.intl;
    if (res.statusCode == 500) {
      notify.show('Error 500', 'error');
      return;
    }
    if (res.statusCode == 403) {
      notify.show(res.body, 'error');
      return;
    }

    if (data.code == 'E_VALIDATION') {
      this.setState({error: data.details});
    } else if (data.id != undefined) {
      notify.show(formatMessage(messages.saved), 'success');
      this.setState({error: null});
      let id = data.id;
      this.props.history.push('/user/' + id);
    }
  }

  _validateAll() {
    let passed = true;
    if (!this.state.username || this.state.username.length == 0) {
      this.setState({bsStyle_username: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_username: 'success'});
    }
    if ((!this.state.edit && this.state.password == null) || (this.state.password != null && this.state.password.length < 6)) {
      this.setState({bsStyle_password: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_password: 'success'});
    }
    if (!this.state.email || this.state.email.length < 3) {
      this.setState({bsStyle_email: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_email: 'success'});
    }
    let s = getSelected(this.state.roles);
    if (s.length == 0) {
      this.setState({bsStyle_roles: 'has-error'});
      passed = false;
    } else {
      this.setState({bsStyle_roles: null});
    }

    return passed;
  }

  _handleNameChange(event) {
    this.setState({username: event.target.value});
  }

  _handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  _handleEmailChange(event) {
    this.setState({email: event.target.value});
  }

  _handleRolesChange(event) {
    let val = event.context.value;
    let sel = event.context.selected;
    let i;
    let roles = [];
    for (i in this.state.roles) {
      roles[i] = this.state.roles[i];
      if (roles[i].value == val) {
        roles[i].selected = sel;
      }
    }
    this.setState({roles: roles});
  }

  _handleGroupsChange(event) {
    let val = event.context.value;
    let sel = event.context.selected;
    let i;
    let groups = [];
    for (i in this.state.groups) {
      groups[i] = this.state.groups[i];
      if (groups[i].value == val) {
        groups[i].selected = sel;
      }
    }
    this.setState({groups: groups});
  }

  render() {
    const {formatMessage} = this.props.intl;

    if (!this.state.allow) {
      return (<Forbidden/>);
    }

    let errorMessage = null;
    if (this.state.error != null) {
      errorMessage = <Alert bsStyle="danger">
        <p>{this.state.error}</p>
      </Alert>;
    }

    let fieldName = <Input type="text" label={formatMessage(messages.userFieldNameLabel)} placeholder={formatMessage(messages.userFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.username} onChange={this._handleNameChange} ref="name" bsStyle={this.state.bsStyle_username}></Input>;

    let fieldPassword = <Input type="password" label={formatMessage(messages.userFieldPasswordLabel)} placeholder={formatMessage(messages.userFieldPasswordPlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.password} onChange={this._handlePasswordChange} ref="password" bsStyle={this.state.bsStyle_password}></Input>;

    let fieldEmail = <Input type="email" label={formatMessage(messages.userFieldEmailLabel)} placeholder={formatMessage(messages.userFieldEmailPlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.email} onChange={this._handleEmailChange} ref="email" bsStyle={this.state.bsStyle_email}></Input>;

    let rolesClass = 'form-group has-feedback ' + this.state.bsStyle_roles;
    let fieldRoles = <div className={rolesClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.userFieldRolesLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleRolesChange} data={this.state.roles} multiple ref="roles"/>
      </div>
    </div>;

    let groupsClass = 'form-group has-feedback ' + this.state.bsStyle_groups;
    let fieldGroups = <div className={groupsClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.userFieldGroupsLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleGroupsChange} data={this.state.groups} multiple ref="groups"/>
      </div>
    </div>;

    let create = null;
    let update = null;
    let remove = null;
    let title = null;

    if (this.state.edit) {
      update = this._update;
      remove = this._remove;
      title = <FormattedMessage {...messages.userEditTitle}/>;
    } else {
      create = this._save;
      title = <FormattedMessage {...messages.userTitle}/>;
    }

    return (
      <Row>
        <PageHeader>{title}</PageHeader>
        <Col xs={12}>
          {errorMessage}
          <form className="form-horizontal">
            {fieldName}
            {fieldPassword}
            {fieldEmail}
            {fieldRoles}
            {fieldGroups}
          </form>
          <EditToolbar create={create} update={update} remove={remove}/>
        </Col>
      </Row>
    );
  }
}

UserEdit.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

UserEdit.propTypes = {
  userId: PropTypes.number
};

export default injectIntl(UserEdit);