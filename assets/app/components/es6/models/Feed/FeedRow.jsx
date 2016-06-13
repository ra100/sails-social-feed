import {Component, PropTypes} from 'react';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {Button, Label} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import EditToolbar from './../../EditToolbar';
import {notify} from 'react-notify-toast';

const messages = defineMessages({
  edit: {
    id: 'button.edit',
    description: 'Edit feed button',
    defaultMessage: 'Edit'
  }
});

class FeedRow extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      deleted: false
    };
    this._bind('_remove', '_edit', 'handleDestroyResponse');
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.delete('/feeds/' + this.props.feed.id, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  _edit() {
    this.context.history.push('/feed/' + this.props.feed.id + '/edit');
  }

  handleDestroyResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true});
    } else {
      notify.show(res.body, 'error');
    }
  }

  render() {
    const {formatMessage} = this.props.intl;
    let {feed} = this.props;

    let groups = null;
    if (feed.groups) {
      groups = feed.groups.map(function (group, i) {
        return <Label key={i}>{group.name}</Label>;
      });
    };

    let en = <i className="material-icons">check_box_outline_blank</i>;
    if (feed.enabled) {
      en = <i className="material-icons">check_box</i>;
    }
    return (
      <tr key={feed.id}>
        <td>
          {en}
          <LinkContainer to={'/feed/' + feed.id}>
            <Button bsStyle="link">{feed.name}</Button>
          </LinkContainer>
        </td>
        <td>
          {feed.type}
        </td>
        <td>
          {feed.config}
        </td>
        <td>
          <EditToolbar edit={this._edit} cancel={false}/>
        </td>
      </tr>
    );
  }
}

FeedRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

FeedRow.propTypes = {
  feed: PropTypes.object.isRequired
};

export default injectIntl(FeedRow);