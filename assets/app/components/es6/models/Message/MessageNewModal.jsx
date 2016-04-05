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
    this._bind('open', 'close', 'save', '_handleMessageChange');
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
  }

  open() {
    this.setState({show: true});
  }

  save() {
    if (this.props.streamId == null) {
      notify.show(this.props.intl.formatMessage(messages.wrongStreamId), 'error');
      this.close();
      return;
    }
    this.close();
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