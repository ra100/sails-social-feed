import {Component, PropTypes,} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader,
  ButtonToolbar,
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl,} from 'react-intl';
import _ from 'lodash';

const messages = defineMessages({
  streamTitle: {
    id: 'stream.new.title',
    description: 'Title of Create stream page',
    defaultMessage: 'Create New Stream',
  },
  streamFieldNamePlaceholder: {
    id: 'stream.field.name.placeholder',
    description: 'Stream Name placeholder',
    defaultMessage: 'Stream Name',
  },
  streamFieldNameLabel: {
    id: 'stream.field.label.name',
    description: 'Stream Name label',
    defaultMessage: 'Name',
  },
  streamFieldStateLabel: {
    id: 'stream.field.state.label',
    description: 'Stream State label',
    defaultMessage: 'State',
  },
  streamStateOptionactive: {
    id: 'stream.field.state.option.active',
    description: 'Stream State Active',
    defaultMessage: 'Active',
  },
  streamStateOptionsleep: {
    id: 'stream.field.state.option.sleep',
    description: 'Stream State Sleep',
    defaultMessage: 'Sleep',
  },
  streamStateOptioninactive: {
    id: 'stream.field.state.option.inactive',
    description: 'Stream State Inactive',
    defaultMessage: 'Inactive',
  },
  streamFieldRefreshLabel: {
    id: 'stream.field.refresh.label',
    description: 'Stream Refresh label',
    defaultMessage: 'Refresh',
  },
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
      refresh: 0
    };
    this._bind('_save', '_init');
    this._init();
  }

  _init() {
    let _self = this;
    this.context.socket.get('/streams/definition', function (data) {
      _self.setState({definition: data, state: data.state.defaultsTo, refresh: date.refresh.defaultsTo});
    });
  }

  _save() {}

  render() {
    const {formatMessage} = this.props.intl;
    const {socket} = this.context;

    let fieldName = <Input type="text" label={formatMessage(messages.streamFieldNameLabel)} placeholder={formatMessage(messages.streamFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5"></Input>;

    let fieldState = <Input type="select" label={formatMessage(messages.streamFieldStateLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.state}>
      {_.map(this.state.definition.state.enum, function (val) {
        return <option value={val} key={val}>
          {formatMessage(messages['streamStateOption' + val])}
        </option>;
      })}
    </Input>;
    let fieldRefresh = <Input type="select" label={formatMessage(messages.streamFieldRefreshLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.refresh}>
      {_.map(this.state.definition.refresh.enum, function (val) {
        return <option value={val} key={val}>{val}</option>;
      })}
    </Input>;

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
            <Button bsStyle="success">Create</Button>
            <Button bsStyle="primary">Cancel</Button>
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