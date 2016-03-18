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
  saved: {
    id: 'user.saved.notify',
    description: 'Saved user notification',
    defaultMessage: 'User has been saved'
  }
});

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
    this._bind('_save', '_update', '_remove', '_handleNameChange', '_handleEmailChange', '_handlePasswordChange', '_validateAll', 'handleSaveResponse', 'handleCanCreate', 'handleCanModify', 'handleLoad');
  }

  componentDidMount() {
    this._isMounted = true;
    let {socket} = this.context;
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
      this.setState({
        status: res.statusCode,
        user: data,
        username: data.username,
        email: data.email,
        roles: [],
        groups: [],
        error: null,
        edit: true
      });
    } else {
      this.setState({status: res.statusCode, error: res.body, user: null});
    }
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/users/create', {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
        _csrf: _csrf
      }, this.handleSaveResponse);
    }
  }

  _update() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/users/update/' + this.props.params.userId, {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email,
        _csrf: _csrf
      }, this.handleSaveResponse);
    }
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.post('/users/destroy/' + this.props.user.id, {
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
    if (this.state.username.length == 0) {
      this.setState({bsStyle_username: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_username: 'success'});
    }
    if ((!this.state.edit && this.state.password == null) && this.state.password.length < 6) {
      this.setState({bsStyle_password: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_password: 'success'});
    }
    if (this.state.email.length < 3) {
      this.setState({bsStyle_email: 'error'});
      passed = false;
    } else {
      this.setState({bsStyle_email: 'success'});
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