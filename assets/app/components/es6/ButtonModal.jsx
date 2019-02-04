import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'

class ButtonModal extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      show: false
    }
    this._bind('open', 'close', 'confirm')
  }

  close() {
    this.setState({ show: false })
  }

  open() {
    this.setState({ show: true })
  }

  confirm() {
    this.props.confirmAction()
    this.close()
  }

  render() {
    let button = (
      <Button bsStyle={this.props.bsStyle} onClick={this.open}>
        {this.props.title}
      </Button>
    )
    if (this.props.bsSize != null) {
      button = (
        <Button
          bsStyle={this.props.bsStyle}
          bsSize={this.props.bsSize}
          onClick={this.open}
        >
          {this.props.title}
        </Button>
      )
    }
    return (
      <span>
        {button}
        <Modal show={this.state.show} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{this.props.message}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.confirm} bsStyle="danger">
              {this.props.confirm}
            </Button>
            <Button onClick={this.close}>{this.props.cancel}</Button>
          </Modal.Footer>
        </Modal>
      </span>
    )
  }
}

ButtonModal.propTypes = {
  title: PropTypes.string,
  modalTitle: PropTypes.string,
  message: PropTypes.string,
  confirm: PropTypes.string,
  confirmAction: PropTypes.func,
  cancel: PropTypes.string,
  bsStyle: PropTypes.string,
  bsSize: PropTypes.string
}

ButtonModal.defaultProps = {
  title: '',
  message: '',
  modalTitle: '',
  confirm: 'OK',
  confirmAction: function() {},
  cancel: 'Cancel',
  bsStyle: 'primary',
  bsSize: null
}

export default ButtonModal
