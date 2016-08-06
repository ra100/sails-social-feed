import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  FormGroup,
  ControlLabel,
  HelpBlock,
  FormControl,
  PageHeader,
  ButtonToolbar,
  Alert
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import EditToolbar from './../../EditToolbar';
import {notify} from 'react-notify-toast';
import Multiselect from 'react-bootstrap-multiselect';
import _ from 'lodash/core';

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
  userFieldAvatarLabel: {
    id: 'user.field.avatar.label',
    description: 'User Avatar label',
    defaultMessage: 'Avatar'
  },
  userFieldDisplaynamePlaceholder: {
    id: 'user.field.displayname.placeholder',
    description: 'User Display Name placeholder',
    defaultMessage: 'Display Name'
  },
  userFieldDisplaynameLabel: {
    id: 'user.field.displayname.label',
    description: 'User Display Name label',
    defaultMessage: 'Display Name'
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
  },
  deletedSuccess: {
    id: 'user.deleted.notify',
    description: 'Info that groups has beed deleted',
    defaultMessage: 'Group has beed deleted.'
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
      bsStyle_displayname: null,
      bsStyle_groups: null,
      bsStyle_roles: null,
      bsStyle_password: null,
      bsStyle_email: null,

      username: '',
      displayname: '',
      groups: null,
      roles: null,
      password: '',
      email: '',
      upload: null,

      user: null,
      edit: false,
      error: null,
      allow: true
    };
    this._bind('_save', '_update', '_remove', '_handleNameChange', '_handleDisplaynameChange', '_handleEmailChange', '_handlePasswordChange', '_validateAll', '_handleRolesChange', '_handleGroupsChange', 'handleSaveResponse', 'handleCanCreate', 'handleCanModify', 'handleLoad', 'handleRoles', 'handleGroups', 'handleDestroyResponse', '_handleUploadChange');
  }

  componentDidMount() {
    this._isMounted = true;
    this.load();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.socket.get('/users/unsubscribe');
    this.context.socket.get('/groups/unsubscribe');
    this.context.socket.get('/roles/unsubscribe');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.userId !== this.props.params.userId) {
      this.setState({user: null, status: 0, error: null});
      this.load(nextProps);
    }
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

  load(nextProps) {
    let {socket} = this.context;
    let userId = this.props.params.userId;
    if (nextProps) {
      userId = nextProps.params.userId;
    }
    socket.get('/roles', {
      populate: 'none'
    }, this.handleRoles);
    socket.get('/groups', {
      populate: 'none',
      sort: 'name'
    }, this.handleGroups);
    if (typeof userId !== 'undefined') {
      socket.get('/users/canmodify/' + userId, this.handleCanModify);
    } else {
      socket.get('/users/cancreate', this.handleCanCreate);
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
        displayname: data.displayname,
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

  _handleUploadChange(event) {
    if (event.target.files !== null) {
      this.setState({
        upload: {
          data: event.target.files[0],
          name: event.target.files[0].name
        }
      });
    } else {
      this.setState({
        upload: null
      });
    }
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      let payload = {
        username: this.state.username,
        displayname: this.state.displayname,
        password: this.state.password,
        email: this.state.email,
        roles: getSelected(this.state.roles),
        groups: getSelected(this.state.groups),
        _csrf: _csrf
      };
      if (this.state.upload !== null) {
        payload.image = this.state.upload;
      }
      socket.post('/users/create', payload, this.handleSaveResponse);
    }
  }

  _update() {
    let {socket} = this.context;
    if (this._validateAll()) {
      let payload = {
        username: this.state.username,
        displayname: this.state.displayname,
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
      if (this.state.upload !== null) {
        payload.image = this.state.upload;
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
      this.context.history.goBack();
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
      this.context.history.push('/user/' + id);
    }
  }

  _validateAll() {
    let passed = true;
    if (this.state.username.length == 0) {
      this.setState({bsStyle_username: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_username: 'success'});
    }
    if (this.state.displayname.length == 0) {
      this.setState({bsStyle_displayname: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_displayname: 'success'});
    }
    if ((!this.state.edit && this.state.password == '') || (this.state.password != '' && this.state.password.length < 6)) {
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

  _handleDisplaynameChange(event) {
    this.setState({displayname: event.target.value});
  }

  _handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  _handleEmailChange(event) {
    this.setState({email: event.target.value});
  }

  _handleRolesChange(event) {
    let val = event[0].value;
    let sel = event[0].selected;
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
    let val = event[0].value;
    let sel = event[0].selected;
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

    let fieldName = <FormGroup controlId="name" className="col-xs-12" validationState={this.state.bsStyle_username}>
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.userFieldNameLabel)}</ControlLabel>
      <Col xs={12} sm={5}>
        <FormControl type="text" value={this.state.username} onChange={this._handleNameChange} ref="name" placeholder={formatMessage(messages.userFieldNamePlaceholder)}/>
        <FormControl.Feedback/>
      </Col>
    </FormGroup>;

    let fieldDisplayname = <FormGroup controlId="displayname" className="col-xs-12" validationState={this.state.bsStyle_displayname}>
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.userFieldDisplaynameLabel)}</ControlLabel>
      <Col xs={12} sm={5}>
        <FormControl type="text" value={this.state.displayname} onChange={this._handleDisplaynameChange} ref="displayname" placeholder={formatMessage(messages.userFieldDisplaynamePlaceholder)}/>
        <FormControl.Feedback/>
      </Col>
    </FormGroup>;

    let fieldPassword = <FormGroup controlId="password" className="col-xs-12" validationState={this.state.bsStyle_password}>
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.userFieldPasswordLabel)}</ControlLabel>
      <Col xs={12} sm={5}>
        <FormControl type="password" value={this.state.password} onChange={this._handlePasswordChange} ref="password" placeholder={formatMessage(messages.userFieldPasswordPlaceholder)}/>
        <FormControl.Feedback/>
      </Col>
    </FormGroup>;

    let fieldEmail = <FormGroup controlId="email" className="col-xs-12" validationState={this.state.bsStyle_email}>
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.userFieldEmailLabel)}</ControlLabel>
      <Col xs={12} sm={5}>
        <FormControl type="email" value={this.state.email} onChange={this._handleEmailChange} ref="email" placeholder={formatMessage(messages.userFieldEmailPlaceholder)}/>
        <FormControl.Feedback/>
      </Col>
    </FormGroup>;

    let rolesClass = 'col-xs-12 form-group has-feedback ' + this.state.bsStyle_roles;
    let fieldRoles = <div className={rolesClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.userFieldRolesLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleRolesChange} data={this.state.roles} multiple ref="roles"/>
      </div>
    </div>;

    let groupsClass = 'col-xs-12 form-group has-feedback ' + this.state.bsStyle_groups;
    let fieldGroups = <div className={groupsClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.userFieldGroupsLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleGroupsChange} data={this.state.groups} multiple ref="groups"/>
      </div>
    </div>;
    let picture = null;
    if (this.state.user !== null && this.state.user.picture) {
      picture = <img src={this.state.user.picture}/>;
    }
    let fieldUpload = <div className="avatar-upload">
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.userFieldAvatarLabel}/>
      </label>
      {picture}
      <input type="file" ref="upload" name="upload" accept="image/*" className="col-xs-12 col-sm-4"/>
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
          <form className="form-horizontal" onChange={this._handleUploadChange}>
            {fieldName}
            {fieldDisplayname}
            {fieldUpload}
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