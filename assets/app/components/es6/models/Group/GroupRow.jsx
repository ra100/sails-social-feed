import {Component, PropTypes} from 'react';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {Button} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import {notify} from 'react-notify-toast';
import EditToolbar from './../../EditToolbar';

const messages = defineMessages({
  edit: {
    id: 'button.edit',
    description: 'Edit group button',
    defaultMessage: 'Edit'
  },
  delete: {
    id: 'button.delete',
    description: 'Delete group button',
    defaultMessage: 'Delete'
  },
  deleteMessage: {
    id: 'modal.delete.message',
    description: 'Delete group modal message',
    defaultMessage: 'Do you really want to delete this group?'
  },
  deleteTitle: {
    id: 'modal.delete.title',
    description: 'Delete group title',
    defaultMessage: 'Warning'
  },
  modalConfirm: {
    id: 'modal.delete.confirm',
    description: 'Delete group modal confirm button',
    defaultMessage: 'Delete'
  },
  modalCancel: {
    id: 'modal.delete.cancel',
    description: 'Delete group modal cancel button',
    defaultMessage: 'Cancel'
  },
  deleted: {
    id: 'group.deleted.row',
    description: 'Info that groups has beed deleted',
    defaultMessage: 'This group has beed deleted.'
  },
  deletedSuccess: {
    id: 'group.deleted.notify',
    description: 'Info that groups has beed deleted',
    defaultMessage: 'Group has beed deleted.'
  }
});

class GroupRow extends Component {

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
      socket.post('/groups/destroy/' + this.props.group.id, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  _edit() {
    this.context.history.push('/group/' + this.props.group.id + '/edit');
  }

  handleDestroyResponse(data, res) {
    const {formatMessage} = this.props.intl;
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true});
      notify.show(formatMessage(messages.deletedSuccess), 'success');
    } else {
      notify.show(res.body, 'error');
    }
  }

  render() {
    const {formatMessage} = this.props.intl;
    let {group} = this.props;
    if (this.state.deleted) {
      return (
        <tr key={group.id}>
          <td colSpan="2" bsStyle="danger"><FormattedMessage {...messages.deleted}/></td>
        </tr>
      );
    }
    return (
      <tr key={group.id}>
        <td>
          <LinkContainer to={'/group/' + group.id}>
            <Button bsStyle="link">{group.name}</Button>
          </LinkContainer>
        </td>
        <td>
          <EditToolbar edit={this._edit} remove={this._remove} cancel={false}/>
        </td>
      </tr>
    );
  }
}

GroupRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

GroupRow.propTypes = {
  group: PropTypes.object.isRequired
};

export default injectIntl(GroupRow);