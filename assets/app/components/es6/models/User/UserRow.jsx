import {Component, PropTypes} from 'react';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {Button, Label} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import EditToolbar from './../../EditToolbar';
import {notify} from 'react-notify-toast';

const messages = defineMessages({
  edit: {
    id: 'button.edit',
    description: 'Edit user button',
    defaultMessage: 'Edit'
  },
  delete: {
    id: 'button.delete',
    description: 'Delete user button',
    defaultMessage: 'Delete'
  },
  deleteMessage: {
    id: 'modal.delete.message',
    description: 'Delete user modal message',
    defaultMessage: 'Do you really want to delete this user?'
  },
  deleteTitle: {
    id: 'modal.delete.title',
    description: 'Delete user title',
    defaultMessage: 'Warning'
  },
  modalConfirm: {
    id: 'modal.delete.confirm',
    description: 'Delete user modal confirm button',
    defaultMessage: 'Delete'
  },
  modalCancel: {
    id: 'modal.delete.cancel',
    description: 'Delete user modal cancel button',
    defaultMessage: 'Cancel'
  },
  deleted: {
    id: 'user.deleted',
    description: 'Info that users has beed deleted',
    defaultMessage: 'This user has beed deleted.'
  }
});

class UserRow extends Component {

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
    this.context.socket.get('/users/unsubscribe');
    this.context.socket.get('/groups/unsubscribe');
    this.context.socket.get('/roles/unsubscribe');
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.post('/users/destroy/' + this.props.user.id, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  _edit() {
    this.context.history.push('/user/' + this.props.user.id + '/edit');
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
    let {user} = this.props;
    if (this.state.deleted) {
      return (
        <tr key={user.id}>
          <td colSpan="2" bsStyle="danger"><FormattedMessage {...messages.deleted}/></td>
        </tr>
      );
    }

    let groups = null;
    if (user.groups) {
      groups = user.groups.map(function (group, i) {
        return <Label key={i}>{group.name}</Label>;
      });
    };
    return (
      <tr key={user.id}>
        <td>
          {user.displayname}
          <LinkContainer to={'/user/' + user.id}>
            <Button bsStyle="link">{user.username}</Button>
          </LinkContainer>
        </td>
        <td>
          {user.email}
        </td>
        <td>
          {user.roles.map(function (role, i) {
            return <Label key={i}>{role.name}</Label>;
          })}
        </td>
        <td>
          {groups}
        </td>
        <td>
          <EditToolbar edit={this._edit} remove={this._remove} cancel={false}/>
        </td>
      </tr>
    );
  }
}

UserRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

UserRow.propTypes = {
  user: PropTypes.object.isRequired
};

export default injectIntl(UserRow);