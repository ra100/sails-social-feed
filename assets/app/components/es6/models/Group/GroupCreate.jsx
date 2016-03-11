import {Component, PropTypes,} from 'react';
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
import {FormattedMessage, defineMessages, injectIntl,} from 'react-intl';
import Forbidden from './../../Forbidden';
import _ from 'lodash';

const messages = defineMessages({
  groupTitle: {
    id: 'group.new.title',
    description: 'Title of Create group page',
    defaultMessage: 'Create New Group',
  },
  groupFieldNamePlaceholder: {
    id: 'group.field.name.placeholder',
    description: 'Group Name placeholder',
    defaultMessage: 'Group Name',
  },
  groupFieldNameLabel: {
    id: 'group.field.label.name',
    description: 'Group Name label',
    defaultMessage: 'Group',
  },
  cancelButton: {
    id: 'button.cancel',
    description: 'Cancel button text',
    defaultMessage: 'Cancel',
  },
  createButton: {
    id: 'button.create',
    description: 'Create button text',
    defaultMessage: 'Create',
  },
});

class GroupCreate extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      name: {
        value: '',
        bsStyle: null,
      },
      error: null,
      allow: true
    };
    this._bind('_save', '_init', '_cancel', '_handleNameChange', '_validateAll', '_evaluateSaveResponse');
    this._init();
  }

  _init() {
    let _self = this;
    let {socket} = this.context;
    socket.get('/groups/cancreate', function (data) {
      if (data.status === 'ok') {
        _self.setState({allow: true});
      } else {
        _self.setState({allow: false});
      }
    });
  }

  _save() {
    let {socket} = this.context;
    let _self = this;
    if (this._validateAll()) {
      socket.post('/groups/create', {
        name: this.state.name.value,
        _csrf: _csrf,
      }, function (data) {
        _self._evaluateSaveResponse(data);
      });
    }
  }

  _cancel() {
    this.props.history.goBack();
  }

  _evaluateSaveResponse(data) {
    if (data.code == 'E_VALIDATION') {
      this.setState({
        error: data.details,
        name: {
          value: this.state.name.value,
          bsStyle: 'error'
        }
      });
    } else if (data.id != undefined) {
      this.setState({error: null});
      let id = data.id;
      //TODO redirect to group view

    }
  }

  _validateAll() {
    let passed = true;
    if (this.state.name.value.length == 0) {
      this.setState({
        name: {
          value: this.state.name.value,
          bsStyle: 'error'
        }
      });
      passed = false;
    } else {
      this.setState({
        name: {
          value: this.state.name.value,
          bsStyle: 'success'
        }
      });
    }

    return passed;
  }

  _handleNameChange(event) {
    this.setState({
      name: {
        value: event.target.value,
        bsStyle: this.state.name.bsStyle
      }
    });
  }

  render() {
    const {formatMessage} = this.props.intl;

    if (!this.state.allow) {
      return (
        <Row>
          <PageHeader>
            <FormattedMessage {...messages.groupTitle}/>
          </PageHeader>
          <Forbidden/>
        </Row>
      );
    }

    let errorMessage = null;
    if (this.state.error != null) {
      errorMessage = <Alert bsStyle="danger">
        <p>{this.state.error}</p>
      </Alert>;
    }

    let fieldName = <Input type="text" label={formatMessage(messages.groupFieldNameLabel)} placeholder={formatMessage(messages.groupFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.name.value} onChange={this._handleNameChange} ref="name" bsStyle={this.state.name.bsStyle}></Input>;

    let cancel = <Button bsStyle="primary" onTouchTap={this._cancel}><FormattedMessage {...messages.cancelButton}/></Button>;

    let create = <Button bsStyle="success" onTouchTap={this._save}><FormattedMessage {...messages.createButton}/></Button>;

    return (
      <Row>
        <PageHeader>
          <FormattedMessage {...messages.groupTitle}/>
        </PageHeader>
        <Col xs={12}>
          {errorMessage}
          <form className="form-horizontal">
            {fieldName}
          </form>
          <ButtonToolbar className="pull-right">
            {create}
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
  socket: PropTypes.object.isRequired,
};

export default injectIntl(GroupCreate);