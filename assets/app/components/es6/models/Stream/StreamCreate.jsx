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
import Forbidden from './../../Forbidden';
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
        }
      },
      state: '',
      refresh: 0,
      name: '',
      nameBsStyle: null,
      allow: true
    };
    this._bind('_save', '_cancel', '_handleStateChange', '_handleRefreshChange', '_handleNameChange', 'handleCanCreate', 'handleDefinition');
  }

  componentDidMount() {
    let {socket} = this.context;
    this._isMounted = true;
    socket.get('/streams/cancreate', this.handleCanCreate);
    socket.get('/streams/definition', this.handleDefinition);
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

  handleDefinition(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (data.state !== undefined) {
      this.setState({definition: data, state: data.state.defaultsTo, refresh: data.refresh.defaultsTo});
    }
  }

  _save() {
    let {socket} = this.context;
    if (this.state.name.length == 0) {
      this.setState({nameBsStyle: 'error'});
    } else {
      this.setState({nameBsStyle: 'success'});
    }
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

    if (!this.state.allow) {
      return (<Forbidden title={formatMessage(messages.groupTitle)}/>);
    }

    let fieldName = <Input type="text" label={formatMessage(messages.streamFieldNameLabel)} placeholder={formatMessage(messages.streamFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.name} onChange={this._handleNameChange} ref="name" bsStyle={this.state.nameBsStyle}></Input>;

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
  socket: PropTypes.object.isRequired
};

export default injectIntl(StreamCreate);