import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Checkbox } from 'react-bootstrap'
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  FormattedDate,
  FormattedTime
} from 'react-intl'
import { notify } from 'react-notify-toast'
import MessageAuthor from './MessageAuthor'
import MessageBody from './MessageBody'

const messages = defineMessages({
  saved: {
    id: 'message.message.saved',
    description: 'Saved message',
    defaultMessage: 'Changes have been saved'
  },
  replyButton: {
    id: 'message.button.reply',
    description: 'Open reply popup button',
    defaultMessage: 'Reply'
  },
  replyto: {
    id: 'message.replyto.text',
    description: 'Label for parent message',
    defaultMessage: 'Is reply to'
  },
  replies: {
    id: 'message.replies.text',
    description: 'Label for parent message',
    defaultMessage: 'Replies'
  }
})

class MessageRow extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      published: null,
      reviewed: null,
      message: null,
      edit: false,
      editable: false
    }
    this._bind(
      '_update',
      '_handlePublishedChange',
      '_handleReviewedChange',
      'handleUpdateResponse',
      '_handleMessageChange',
      '_handleEdit',
      '_remove',
      '_update',
      '_cancel',
      '_getType',
      'reply'
    )
  }

  componentDidMount() {
    this._isMounted = true
    var editable = false
    if (typeof this.props.message.author.id == 'undefined') {
      editable = true
    }
    this.setState({
      published: this.props.message.published,
      reviewed: this.props.message.reviewed,
      message: this.props.message.message,
      editable: editable
    })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.published !== nextProps.message.published ||
      this.state.reviewed !== nextProps.message.reviewed ||
      this.props.message.message !== nextProps.message.message
    ) {
      this.setState({
        published: nextProps.message.published,
        reviewed: nextProps.message.reviewed,
        message: nextProps.message.message
      })
    }
  }

  handleUpdateResponse(data, res) {
    const { formatMessage } = this.props.intl
    switch (res.statusCode) {
      case 500:
        notify.show('Error 500', 'error')
        break
      case 200:
        notify.show(formatMessage(messages.saved), 'success')
        break
      default:
        notify.show(res.body, 'error')
        break
    }
  }

  reply() {
    this.props.replyCallback(this.props.message.id)
  }

  _update() {
    let { socket } = this.context
    let { message } = this.props
    let payload = {
      id: message.id,
      published: this.state.published,
      reviewed: this.state.reviewed,
      _csrf: window._csrf
    }
    if (this.state.edit) {
      payload.message = this.state.message
    }
    socket.put('/messages/' + message.id, payload, this.handleUpdateResponse)
    this.setState({ edit: false })
  }

  _handlePublishedChange() {
    this.setState(
      {
        published: this.published.checked,
        reviewed: true
      },
      this._update
    )
  }

  _handleReviewedChange() {
    this.setState(
      {
        reviewed: this.reviewed.checked
      },
      this._update
    )
  }

  _handleEdit() {
    this.setState({ edit: true })
  }

  _handleMessageChange(event) {
    this.setState({ message: event.target.value })
  }

  _remove() {
    let { socket } = this.context
    socket.delete(
      '/messages/' + this.props.message.id,
      {
        _csrf: window._csrf
      },
      this.handleUpdateResponse
    )
    this.setState({ edit: false })
  }

  _cancel() {
    this.setState({ edit: false })
  }

  _getType(m) {
    let message = m || this.props.message
    switch (message.feedType) {
      case 'twitter_hashtag':
      case 'twitter_user':
        return 'twitter'
      case 'facebook_page':
      case 'facebook_user':
        return 'facebook'
      case 'admin':
        return 'admin'
      default:
        return 'admin'
    }
  }

  render() {
    const { formatMessage } = this.props.intl
    const { message } = this.props
    const type = this._getType()
    let reply = null
    if (this.props.replyCallback !== null && !message.isResponse) {
      reply = (
        <Button onClick={this.reply} bsStyle="default">
          {formatMessage(messages.replyButton)}
        </Button>
      )
    }
    let related = null
    if (typeof message.parentMessage == 'object') {
      related = (
        <span className="parent-message">
          <FormattedMessage {...messages.replyto} />:
          <MessageBody
            type={this._getType(message.parentMessage)}
            message={message.parentMessage}
            meta={message.parentMessage.message.metadata}
          />
        </span>
      )
    }
    let replies = null
    if (message.relatedMessage && message.relatedMessage.length > 0) {
      replies = (
        <span className="reply-count">
          <FormattedMessage {...messages.replies} />:{' '}
          {message.relatedMessage.length}
        </span>
      )
    }
    return (
      <tr key={message.id}>
        <td>
          <Checkbox
            checked={this.state.published}
            inputRef={ref => {
              this.published = ref
            }}
            onChange={this._handlePublishedChange}
          />
        </td>

        <td>
          <Checkbox
            checked={this.state.reviewed}
            inputRef={ref => {
              this.reviewed = ref
            }}
            onChange={this._handleReviewedChange}
          />
        </td>

        <td>
          <FormattedTime value={new Date(message.created)} />
          <br />
          <FormattedDate value={new Date(message.created)} />
        </td>

        <td>
          <MessageAuthor type={type} author={message.author} />
        </td>

        <td>
          <MessageBody
            type={type}
            message={message}
            meta={message.metadata}
            editable={this.state.editable}
          />
          {reply}
          {related}
          {replies}
        </td>

        <td>{message.feedType}</td>
      </tr>
    )
  }
}

MessageRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

MessageRow.propTypes = {
  intl: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired,
  replyCallback: PropTypes.func
}

MessageRow.defaultTypes = {
  replyCallback: null
}

export default injectIntl(MessageRow)
