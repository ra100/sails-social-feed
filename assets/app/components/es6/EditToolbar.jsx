import {Component, PropTypes} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import ButtonModal from './ButtonModal';

const messages = defineMessages({
  cancelButton: {
    id: 'button.cancel',
    description: 'Cancel button text',
    defaultMessage: 'Cancel'
  },
  createButton: {
    id: 'button.create',
    description: 'Create button text',
    defaultMessage: 'Create'
  },
  saveButton: {
    id: 'button.save',
    description: 'Save button text',
    defaultMessage: 'Save'
  },
  editButton: {
    id: 'button.edit',
    description: 'Edit button text',
    defaultMessage: 'Edit'
  },
  deleteButton: {
    id: 'button.delete',
    description: 'Delete button text',
    defaultMessage: 'Delete'
  },
  deleteMessage: {
    id: 'modal.delete.message',
    description: 'Delete item modal message',
    defaultMessage: 'Do you really want to delete this item?'
  },
  deleteTitle: {
    id: 'modal.delete.title',
    description: 'Delete item title',
    defaultMessage: 'Warning'
  },
  modalConfirm: {
    id: 'modal.delete.confirm',
    description: 'Delete item modal confirm button',
    defaultMessage: 'Delete'
  },
  modalCancel: {
    id: 'modal.delete.cancel',
    description: 'Delete item modal cancel button',
    defaultMessage: 'Cancel'
  }
});

class EditToolbar extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this._bind('_cancel');
  }

  _cancel() {
    this.context.history.goBack();
  }

  render() {
    const {formatMessage} = this.props.intl;
    let edit = null,
      create = null,
      update = null,
      remove = null;

    let cancel = <Button bsStyle="primary" onTouchTap={this._cancel}><FormattedMessage {...messages.cancelButton}/></Button>;

    if (this.props.update) {
      update = <Button bsStyle="success" onTouchTap={this.props.update}><FormattedMessage {...messages.saveButton}/></Button>;
    }
    if (this.props.create) {
      create = <Button bsStyle="success" onTouchTap={this.props.create}><FormattedMessage {...messages.createButton}/></Button>;
    }

    if (this.props.remove) {
      remove = <ButtonModal title={formatMessage(messages.deleteButton)} modalTitle={formatMessage(messages.deleteTitle)} message={formatMessage(messages.deleteMessage)} confirm={formatMessage(messages.modalConfirm)} cancel={formatMessage(messages.modalCancel)} bsStyle="danger" confirmAction={this.props.remove}/>;
    }

    if (this.props.edit) {
      edit = <Button bsStyle="primary" onTouchTap={this.props.edit}><FormattedMessage {...messages.editButton}/></Button>;
    }

    return (
      <ButtonToolbar className="pull-right">
        {edit}
        {create}
        {update}
        {remove}
        {cancel}
      </ButtonToolbar>
    );
  }
}

EditToolbar.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

EditToolbar.propTypes = {
  edit: PropTypes.func,
  create: PropTypes.func,
  update: PropTypes.func,
  remove: PropTypes.func
};

EditToolbar.defaultTypes = {
  edit: null,
  create: null,
  update: null,
  remove: null
};

export default injectIntl(EditToolbar);