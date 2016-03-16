import {Component, PropTypes} from 'react';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {Button} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import ButtonModal from './../../ButtonModal';

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
    id: 'group.deleted',
    description: 'Info that groups has beed deleted',
    defaultMessage: 'This group has beed deleted.'
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
    this._bind('_delete', 'handleDestroyResponse');
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _delete() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.post('/groups/destroy/' + this.props.group.id, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  handleDestroyResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true});
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
          <LinkContainer to={'/group/' + group.id + '/edit'}>
            <Button bsStyle="success">
              <FormattedMessage {...messages.edit}/>
            </Button>
          </LinkContainer>
          <ButtonModal title={formatMessage(messages.delete)} modalTitle={formatMessage(messages.deleteTitle)} message={formatMessage(messages.deleteMessage)} confirm={formatMessage(messages.modalConfirm)} cancel={formatMessage(messages.modalCancel)} bsStyle="danger" confirmAction={this._delete}/>
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