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
  groupTitle: {
    id: 'group.new.title',
    description: 'Title of Create group page',
    defaultMessage: 'Create New Group'
  },
  groupEditTitle: {
    id: 'group.edit.title',
    description: 'Title of Edit group page',
    defaultMessage: 'Edit Group'
  },
  groupFieldNamePlaceholder: {
    id: 'group.field.name.placeholder',
    description: 'Group Name placeholder',
    defaultMessage: 'Group Name'
  },
  groupFieldNameLabel: {
    id: 'group.field.label.name',
    description: 'Group Name label',
    defaultMessage: 'Group'
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

class GroupCreate extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      bsStyle: {
        name: null
      },
      group: {
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
    if (this.props.params.groupId >= 0) {
      socket.get('/groups/canmodify/' + this.props.params.groupId, this.handleCanModify);
    } else {
      socket.get('/groups/cancreate', this.handleCanCreate);
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
      socket.get('/groups/' + this.props.params.groupId, this.handleLoad);
    } else {
      this.setState({allow: false});
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({status: res.statusCode, group: data, error: null});
    } else {
      this.setState({status: res.statusCode, error: res.body, group: null});
    }
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/groups/create', {
        name: this.state.group.name,
        _csrf: _csrf
      }, this._evaluateSaveResponse);
    }
  }

  _update() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/groups/update/' + this.props.params.groupId , {
        name: this.state.group.name,
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
      this.props.history.push('/group/' + id);
    }
  }

  _validateAll() {
    let passed = true;
    if (this.state.group.name.length == 0) {
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
      group: {
        name: event.target.value
      }
    });
  }

  render() {
    const {formatMessage} = this.props.intl;

    if (!this.state.allow) {
      return (<Forbidden title={formatMessage(messages.groupTitle)}/>);
    }

    let errorMessage = null;
    if (this.state.error != null) {
      errorMessage = <Alert bsStyle="danger">
        <p>{this.state.error}</p>
      </Alert>;
    }

    let fieldName = <Input type="text" label={formatMessage(messages.groupFieldNameLabel)} placeholder={formatMessage(messages.groupFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.group.name} onChange={this._handleNameChange} ref="name" bsStyle={this.state.bsStyle.name}></Input>;

    let create = null;
    let save = null;
    let title = null;

    if (this.state.edit) {
      save = <Button bsStyle="success" onTouchTap={this._update}><FormattedMessage {...messages.saveButton}/></Button>;
      title = <FormattedMessage {...messages.groupEditTitle}/>;
    } else {
      create = <Button bsStyle="success" onTouchTap={this._save}><FormattedMessage {...messages.createButton}/></Button>;
      title = <FormattedMessage {...messages.groupTitle}/>;
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

GroupCreate.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

GroupCreate.propTypes = {
  groupId: PropTypes.number
};

export default injectIntl(GroupCreate);