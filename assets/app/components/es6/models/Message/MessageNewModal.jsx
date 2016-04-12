import {Component, PropTypes} from 'react';
import {Button, Modal, Row, Input} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {notify} from 'react-notify-toast';

const messages = defineMessages({
  cancelButton: {
    id: 'button.cancel',
    description: 'Cancel button text',
    defaultMessage: 'Cancel'
  },
  saveButton: {
    id: 'button.save',
    description: 'Save button text',
    defaultMessage: 'Save'
  },
  messageNew: {
    id: 'message.new.title',
    description: 'New message title',
    defaultMessage: 'Create message'
  },
  messageFieldMessageLabel: {
    id: 'message.field.message.label',
    description: 'Message message label',
    defaultMessage: 'Message'
  },
  messageFieldMessagePlaceholder: {
    id: 'message.field.message.placeholder',
    description: 'Message message placeholder',
    defaultMessage: 'Write message here'
  },
  wrongStreamId: {
    id: 'message.error.wrong.stream.id',
    description: 'If no stream id is provided before save',
    defaultMessage: 'Wrong stream ID'
  },
  saved: {
    id: 'message.saved.message',
    description: 'Saved notification',
    defaultMessage: 'Message has been saved'
  }
});

class MessageNewModal extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      show: false,
      message: '',
      bsStyle_message: null
    };
    this._bind('open', 'close', 'save', '_handleMessageChange', 'handleSaveResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({show: this.props.show});
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.state.show) {
      this.setState({show: nextProps.show});
    }
  }

  close() {
    this.setState({show: false});
    if (this.props.onHide) {
      this.props.onHide();
    }
  }

  open() {
    this.setState({show: true});
  }

  save() {
    if (this.props.streamId == null || this.props.streamId == undefined) {
      notify.show(this.props.intl.formatMessage(messages.wrongStreamId), 'error');
      this.close();
      return;
    }
    if (this.state.message.length == 0) {
      this.setState({bsStyle_message: 'error'});
      return;
    }
    let payload = {
      message: this.state.message,
      stream: this.props.streamId,
      isAnswer: false,
      _csrf: _csrf
    };
    if (this.props.parentId > 0) {
      payload.isAnswer = true;
      payload.relatedMessage = this.props.parentId;
    }
    socket.post('/messages', payload, this.handleSaveResponse);
    this.setState({bsStyle_message: null});
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
      notify.show(data.details, 'error');
    } else if (data.id != undefined) {
      notify.show(formatMessage(messages.saved), 'success');
      this.setState({message: ''});
      this.close();
    }
  }

  _handleMessageChange(event) {
    this.setState({message: event.target.value});
  }

  render() {
    const {formatMessage} = this.props.intl;

    let fieldMessage = <Input type="textarea" label={formatMessage(messages.messageFieldMessageLabel)} placeholder={formatMessage(messages.messageFieldMessagePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-10" value={this.state.message} onChange={this._handleMessageChange} ref="name" bsStyle={this.state.bsStyle_message}></Input>;

    return (
      <span>
        <Modal show={this.state.show} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{formatMessage(messages.messageNew)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>{fieldMessage}</Row>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.save} bsStyle="success">{formatMessage(messages.saveButton)}</Button>
            <Button onClick={this.close}>{formatMessage(messages.cancelButton)}</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

MessageNewModal.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

MessageNewModal.propTypes = {
  streamId: PropTypes.string,
  parentId: PropTypes.string,
  show: PropTypes.bool
};

export default injectIntl(MessageNewModal);