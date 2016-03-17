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
    defaultMessage: 'User Name'
  },
  userFieldNameLabel: {
    id: 'user.field.label.name',
    description: 'User Name label',
    defaultMessage: 'User'
  },
  cancelButton: {
    id: 'button.cancel',
    description: 'Cancel button text',
    defaultMessage: 'Cancel'
  },
  createButton: {
    id: 'button.create',
    description: 'Create button text',
    defaultMessage: 'Create'
  },
  saveButton: {
    id: 'button.save',
    description: 'Save button text',
    defaultMessage: 'Save'
  }
});

class UserEdit extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      bsStyle: {
        name: null
      },
      user: {
        name: null
      },
      edit: false,
      error: null,
      allow: true
    };
    this._bind('_save', '_cancel', '_update', '_handleNameChange', '_validateAll', '_evaluateSaveResponse', 'handleCanCreate', 'handleCanModify', 'handleLoad');
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
      this.setState({status: res.statusCode, user: data, error: null});
    } else {
      this.setState({status: res.statusCode, error: res.body, user: null});
    }
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/users/create', {
        name: this.state.user.name,
        _csrf: _csrf
      }, this._evaluateSaveResponse);
    }
  }

  _update() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/users/update/' + this.props.params.userId , {
        name: this.state.user.name,
        _csrf: _csrf
      }, this._evaluateSaveResponse);
    }
  }

  _cancel() {
    this.props.history.goBack();
  }

  _evaluateSaveResponse(data) {
    if (data.code == 'E_VALIDATION') {
      this.setState({
        error: data.details,
        bsStyle: {
          name: 'error'
        }
      });
    } else if (data.id != undefined) {
      this.setState({error: null});
      let id = data.id;
      this.props.history.push('/user/' + id);
    }
  }

  _validateAll() {
    let passed = true;
    if (this.state.user.name.length == 0) {
      this.setState({
        bsStyle: {
          name: 'error'
        }
      });
      passed = false;
    } else {
      this.setState({
        bsStyle: {
          name: 'success'
        }
      });
    }

    return passed;
  }

  _handleNameChange(event) {
    this.setState({
      user: {
        name: event.target.value
      }
    });
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

    let fieldName = <Input type="text" label={formatMessage(messages.userFieldNameLabel)} placeholder={formatMessage(messages.userFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.user.name} onChange={this._handleNameChange} ref="name" bsStyle={this.state.bsStyle.name}></Input>;

    let create = null;
    let save = null;
    let title = null;

    if (this.state.edit) {
      save = <Button bsStyle="success" onTouchTap={this._update}><FormattedMessage {...messages.saveButton}/></Button>;
      title = <FormattedMessage {...messages.userEditTitle}/>;
    } else {
      create = <Button bsStyle="success" onTouchTap={this._save}><FormattedMessage {...messages.createButton}/></Button>;
      title = <FormattedMessage {...messages.userTitle}/>;
    }

    let cancel = <Button bsStyle="primary" onTouchTap={this._cancel}><FormattedMessage {...messages.cancelButton}/></Button>;

    return (
      <Row>
        <PageHeader>{title}</PageHeader>
        <Col xs={12}>
          {errorMessage}
          <form className="form-horizontal">
            {fieldName}
          </form>
          <ButtonToolbar className="pull-right">
            {create}
            {save}
            {cancel}
          </ButtonToolbar>
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