import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Modal,
  FormGroup,
  ControlLabel,
  FormControl,
  Col
} from 'react-bootstrap'
import { defineMessages, injectIntl } from 'react-intl'
import { notify } from 'react-notify-toast'
import Loading from './../../Loading'

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
  messageFieldUploadLabel: {
    id: 'message.field.upload.label',
    description: 'Message upload label',
    defaultMessage: 'Upload image'
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
})

class MessageNewModal extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      show: false,
      message: '',
      upload: null,
      uploading: false,
      bsStyle_message: null,
      bsStyle_upload: null
    }
    this._bind(
      'open',
      'close',
      'save',
      '_handleMessageChange',
      'handleSaveResponse',
      '_handleUploadChange'
    )
  }

  componentDidMount() {
    this._isMounted = true
    this.setState({ show: this.props.show })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.state.show) {
      this.setState({ show: nextProps.show })
    }
  }

  close() {
    this.setState({ show: false })
    if (this.props.onHide) {
      this.props.onHide()
    }
  }

  open() {
    this.setState({ show: true })
  }

  save() {
    if (this.props.streamId == null || this.props.streamId == undefined) {
      notify.show(
        this.props.intl.formatMessage(messages.wrongStreamId),
        'error'
      )
      this.close()
      return
    }
    if (this.state.message.length == 0 && this.state.upload == null) {
      this.setState({ bsStyle_message: 'error' })
      return
    }
    let payload = {
      message: this.state.message,
      stream: this.props.streamId,
      author: this.context.user.id,
      isResponse: false,
      _csrf: window._csrf
    }
    if (this.state.upload !== null) {
      payload.image = this.state.upload
    }
    if (
      typeof this.props.parentId !== 'undefined' &&
      this.props.parentId !== ''
    ) {
      payload.isResponse = true
      payload.parentMessage = this.props.parentId
    }
    window.socket.post('/messages', payload, this.handleSaveResponse)
    this.setState({ bsStyle_message: null, loading: true })
  }

  handleSaveResponse(data, res) {
    const { formatMessage } = this.props.intl
    this.setState({ loading: false })
    if (res.statusCode == 500) {
      notify.show('Error 500', 'error')
      return
    }
    if (res.statusCode == 403) {
      notify.show(res.body, 'error')
      return
    }

    if (data.code == 'E_VALIDATION') {
      notify.show(data.details, 'error')
    } else if (data.id != undefined) {
      notify.show(formatMessage(messages.saved), 'success')
      this.setState({ message: '' })
      this.close()
    }
  }

  _handleMessageChange(event) {
    this.setState({ message: event.target.value })
  }

  _handleUploadChange(event) {
    this.setState({
      upload: {
        data: event.target.files[0],
        name: event.target.files[0].name
      }
    })
  }

  render() {
    const { formatMessage } = this.props.intl

    let fieldMessage = (
      <FormGroup
        controlId="message"
        validationState={this.state.bsStyle_message}
        className="col-xs-12"
      >
        <ControlLabel className="col-xs-12 col-sm-10">
          {formatMessage(messages.messageFieldMessageLabel)}
        </ControlLabel>
        <Col sm={10} xs={12}>
          <FormControl
            componentClass="textarea"
            placeholder={formatMessage(messages.messageFieldMessagePlaceholder)}
            value={this.state.message}
            onChange={this._handleMessageChange}
          />
        </Col>
      </FormGroup>
    )

    let filename = null

    if (this.state.upload !== null) {
      filename = <strong>: {this.state.upload.name}</strong>
    }

    let fieldUpload = (
      <FormGroup controlId="upload" className="col-xs-12">
        <ControlLabel className="col-xs-12 col-sm-10">
          {formatMessage(messages.messageFieldUploadLabel)}
          {filename}
        </ControlLabel>
        <FormControl
          onChange={this._handleUploadChange}
          type="file"
          name="upload"
          accept="image/*"
          className="col-xs-12 col-sm-10 col-sm-offset-2"
        />
      </FormGroup>
    )

    let body = (
      <Modal.Body>
        {fieldMessage}
        {fieldUpload}
      </Modal.Body>
    )

    if (this.state.loading) {
      body = (
        <Modal.Body>
          <Loading />
        </Modal.Body>
      )
    }

    return (
      <Modal show={this.state.show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>{formatMessage(messages.messageNew)}</Modal.Title>
        </Modal.Header>
        {body}
        <Modal.Footer>
          <Button onClick={this.save} bsStyle="success">
            {formatMessage(messages.saveButton)}
          </Button>
          <Button onClick={this.close}>
            {formatMessage(messages.cancelButton)}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

MessageNewModal.contextTypes = {
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

MessageNewModal.propTypes = {
  intl: PropTypes.object.isRequired,
  onHide: PropTypes.func,
  streamId: PropTypes.string,
  parentId: PropTypes.string,
  show: PropTypes.bool
}

export default injectIntl(MessageNewModal)
