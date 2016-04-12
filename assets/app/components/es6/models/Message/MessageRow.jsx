import {Component, PropTypes} from 'react';
import {Row, Button, PageHeader, Input, Label} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import {FormattedMessage, defineMessages, injectIntl, FormattedDate, FormattedTime} from 'react-intl';
import {notify} from 'react-notify-toast';
import _ from 'lodash';

const messages = defineMessages({
  saved: {
    id: 'message.message.saved',
    description: 'Saved message',
    defaultMessage: 'Changes have been saved'
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
      reviewed: null
    };
    this._bind('_update', '_handlePublishedChange', '_handleReviewedChange', 'handleUpdateResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({published: this.props.message.published, reviewed: this.props.message.reviewed});
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.published !== nextProps.message.published || this.state.reviewed !== nextProps.message.reviewed || this.props.message.message !== nextProps.message.message) {
      this.setState({published: nextProps.message.published, reviewed: nextProps.message.reviewed});
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

  _update() {
    let {socket} = this.context;
    let {message} = this.props;
    socket.put('/messages/' + message.id, {
      id: message.id,
      published: this.state.published,
      reviewed: this.state.reviewed,
      _csrf: _csrf
    }, this.handleUpdateResponse);
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

  render() {
    const {formatMessage} = this.props.intl;
    let {message} = this.props;
    let published = <Input type="checkbox" checked={this.state.published} ref="published" onChange={this._handlePublishedChange} label=" "/>;
    let reviewed = <Input type="checkbox" checked={this.state.reviewed} ref="reviewed" onChange={this._handleReviewedChange} label=" "/>;
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
          {message.message}
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
  message: PropTypes.object.isRequired
};

export default injectIntl(MessageRow);