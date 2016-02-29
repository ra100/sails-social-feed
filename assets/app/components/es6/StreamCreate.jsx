import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader,
  ButtonToolbar
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './Forbidden';
import _ from 'lodash';

const messages = defineMessages({
  streamTitle: {
    id: 'stream.new.title',
    description: 'Title of Create stream page',
    defaultMessage: 'Create New Stream'
  },
  streamFieldNamePlaceholder: {
    id: 'stream.field.name.placeholder',
    description: 'Stream Name placeholder',
    defaultMessage: 'Stream Name'
  },
  streamFieldNameLabel: {
    id: 'stream.field.label.name',
    description: 'Stream Name label',
    defaultMessage: 'Name'
  },
  streamFieldStateLabel: {
    id: 'stream.field.state.label',
    description: 'Stream State label',
    defaultMessage: 'State'
  },
  streamStateOptionactive: {
    id: 'stream.field.state.option.active',
    description: 'Stream State Active',
    defaultMessage: 'Active'
  },
  streamStateOptionsleep: {
    id: 'stream.field.state.option.sleep',
    description: 'Stream State Sleep',
    defaultMessage: 'Sleep'
  },
  streamStateOptioninactive: {
    id: 'stream.field.state.option.inactive',
    description: 'Stream State Inactive',
    defaultMessage: 'Inactive'
  },
  streamFieldRefreshLabel: {
    id: 'stream.field.refresh.label',
    description: 'Stream Refresh label',
    defaultMessage: 'Refresh'
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
  }
});

class StreamCreate extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      definition: {
        state: {
          enum: []
        },
        refresh: {
          enum: []
        },
      },
      state: '',
      refresh: 0,
      name: '',
      allow: true,
    };
    this._bind('_save', '_init', '_cancel', '_handleStateChange', '_handleRefreshChange', '_handleNameChange');
    this._init();
  }

  _init() {
    let _self = this;
    let socket = this.context.socket;
    socket.get('/streams/cancreate', function (data) {
      if (data.status === 'ok') {
        _self.setState({allow: true});
      } else {
        _self.setState({allow: false});
      }
    });
    socket.get('/streams/definition', function (data) {
      if (data.state !== undefined) {
        _self.setState({definition: data, state: data.state.defaultsTo, refresh: data.refresh.defaultsTo});
      }
    });
  }

  _save() {
    console.log(this.state);
    let socket = this.context.socket;
  }

  _cancel() {
    this.props.history.goBack();
  }

  _handleStateChange(event) {
    this.setState({state: event.target.value});
  }

  _handleRefreshChange(event) {
    this.setState({refresh: event.target.value});
  }

  _handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  render() {
    const {formatMessage} = this.props.intl;
    const {socket} = this.context;

    let fieldName = <Input type="text" label={formatMessage(messages.streamFieldNameLabel)} placeholder={formatMessage(messages.streamFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.name} onChange={this._handleNameChange}></Input>;

    let fieldState = <Input type="select" label={formatMessage(messages.streamFieldStateLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.state} onChange={this._handleStateChange}>
      {_.map(this.state.definition.state.enum, function (val) {
        return <option value={val} key={val}>
          {formatMessage(messages['streamStateOption' + val])}
        </option>;
      })}
    </Input>;

    let fieldRefresh = <Input type="select" label={formatMessage(messages.streamFieldRefreshLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.refresh} onChange={this._handleRefreshChange}>
      {_.map(this.state.definition.refresh.enum, function (val) {
        return <option value={val} key={val}>{val}</option>;
      })}
    </Input>;

    let cancel = <Button bsStyle="primary" onTouchTap={this._cancel}><FormattedMessage {...messages.cancelButton}/></Button>;

    let create = <Button bsStyle="success" onTouchTap={this._save}><FormattedMessage {...messages.createButton}/></Button>;

    if (!this.state.allow) {
      return (
        <Row>
          <PageHeader>
            <FormattedMessage {...messages.streamTitle}/>
          </PageHeader>
          {< Forbidden />}
        </Row>
      );
    }

    return (
      <Row>
        <PageHeader>
          <FormattedMessage {...messages.streamTitle}/>
        </PageHeader>
        <Col xs={12}>
          <form className="form-horizontal">
            {fieldName}
            {fieldState}
            {fieldRefresh}
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

StreamCreate.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired,
};

export default injectIntl(StreamCreate);