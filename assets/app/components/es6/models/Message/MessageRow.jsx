import {Component, PropTypes} from 'react';
import {Row, Button, PageHeader, Input, Label} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import {FormattedMessage, defineMessages, injectIntl, FormattedDate, FormattedTime} from 'react-intl';
import {notify} from 'react-notify-toast';
import _ from 'lodash/core';
import EditToolbar from './../../EditToolbar';
import MessageAuthor from './MessageAuthor';
import MessageBody from './MessageBody';

const messages = defineMessages({
  saved: {
    id: 'message.message.saved',
    description: 'Saved message',
    defaultMessage: 'Changes have been saved'
  },
  replyButton: {
    'id': 'message.button.reply',
    'description': 'Open reply popup button',
    'defaultMessage': 'Reply'
  }
});

class MessageRow extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      published: null,
      reviewed: null,
      message: null,
      edit: false,
      editable: false
    };
    this._bind('_update', '_handlePublishedChange', '_handleReviewedChange', 'handleUpdateResponse', '_handleMessageChange', '_handleEdit', '_remove', '_update', '_cancel', '_getType', 'reply');
  }

  componentDidMount() {
    this._isMounted = true;
    var editable = false;
    if (typeof this.props.message.author.id == 'undefined') {
      editable = true;
    }
    this.setState({published: this.props.message.published, reviewed: this.props.message.reviewed, message: this.props.message.message, editable: editable});
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.published !== nextProps.message.published || this.state.reviewed !== nextProps.message.reviewed || this.props.message.message !== nextProps.message.message) {
      this.setState({published: nextProps.message.published, reviewed: nextProps.message.reviewed, message: nextProps.message.message});
    }
  }

  handleUpdateResponse(data, res) {
    const {formatMessage} = this.props.intl;
    switch (res.statusCode) {
      case 500:
        notify.show('Error 500', 'error');
        break;
      case 200:
        notify.show(formatMessage(messages.saved), 'success');
        break;
      default:
        notify.show(res.body, 'error');
        break;
    }
  }

  reply() {
    this.props.replyCallback(this.props.message.id);
  }

  _update() {
    let {socket} = this.context;
    let {message} = this.props;
    let payload = {
      id: message.id,
      published: this.state.published,
      reviewed: this.state.reviewed,
      _csrf: _csrf
    };
    if (this.state.edit) {
      payload.message = this.state.message;
    }
    socket.put('/messages/' + message.id, payload, this.handleUpdateResponse);
    this.setState({edit: false});
  }

  _handlePublishedChange(event) {
    this.setState({
      published: this.refs.published.refs.input.checked,
      reviewed: true
    }, this._update);
  }

  _handleReviewedChange(event) {
    this.setState({
      reviewed: this.refs.reviewed.refs.input.checked
    }, this._update);
  }

  _handleEdit(event) {
    this.setState({edit: true});
  }

  _handleMessageChange(event) {
    this.setState({message: event.target.value});
  }

  _remove() {
    let {socket} = this.context;
    socket.delete('/messages/' + this.props.message.id, {
      _csrf: _csrf
    }, this.handleUpdateResponse);
    this.setState({edit: false});
  }

  _cancel() {
    this.setState({edit: false});
  }

  _getType() {
    let {message} = this.props;
    switch(message.feedType) {
      case 'twitter_hashtag':
      case 'twitter_user':
        return 'twitter';
      case 'admin':
        return 'admin';
      default:
        return 'admin';
    }
  }

  render() {
    const {formatMessage} = this.props.intl;
    let {message} = this.props;
    let published = <Input type="checkbox" checked={this.state.published} ref="published" onChange={this._handlePublishedChange} label=" "/>;
    let reviewed = <Input type="checkbox" checked={this.state.reviewed} ref="reviewed" onChange={this._handleReviewedChange} label=" "/>;
    let type = this._getType();
    let reply = null;
    if (this.props.replyCallback !== null) {
      reply = <Button onClick={this.reply} bsStyle="default">{formatMessage(messages.replyButton)}</Button>;
    }
    return (
      <tr key={message.id}>
        <td>
          {published}
        </td>

        <td>
          {reviewed}
        </td>

        <td>
          <FormattedTime value={new Date(message.created)}/>
          <br/>
          <FormattedDate value={new Date(message.created)}/>
        </td>

        <td>
          <MessageAuthor type={type} author={message.author}/>
        </td>

        <td>
          <MessageBody type={type} message={message} meta={message.metadata} editable={this.state.editable}/>
          {reply}
        </td>

        <td>
          {message.feedType}
        </td>
      </tr>
    );
  }
}

MessageRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

MessageRow.propTypes = {
  message: PropTypes.object.isRequired,
  replyCallback: PropTypes.func
};

MessageRow.defaultTypes = {
  replyCallback: null
};


export default injectIntl(MessageRow);