import {Component, PropTypes} from 'react';
import {
  Alert,
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader,
  ButtonToolbar
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import EditToolbar from './../../EditToolbar';
import {notify} from 'react-notify-toast';
import Multiselect from 'react-bootstrap-multiselect';
import _ from 'lodash';
import 'jquery-browserify';

const messages = defineMessages({
  streamTitle: {
    id: 'stream.new.title',
    description: 'Title of Create stream page',
    defaultMessage: 'Create New Stream'
  },
  streamEditTitle: {
    id: 'stream.edit.title',
    description: 'Title of Edit stream page',
    defaultMessage: 'Edit stream'
  },
  streamFieldNamePlaceholder: {
    id: 'stream.field.name.placeholder',
    description: 'Stream Name placeholder',
    defaultMessage: 'Stream Name'
  },
  streamFieldNameLabel: {
    id: 'stream.field.name.label',
    description: 'Stream Name label',
    defaultMessage: 'Name'
  },
  streamFieldUniqueNamePlaceholder: {
    id: 'stream.field.uniquename.placeholder',
    description: 'Stream Unique Name placeholder',
    defaultMessage: 'unique_name'
  },
  streamFieldUniqueNameLabel: {
    id: 'stream.field.uniquename.label',
    description: 'Stream Uniqie Name label',
    defaultMessage: 'Uniqie Name'
  },
  streamFieldStateLabel: {
    id: 'stream.field.state.label',
    description: 'Stream State label',
    defaultMessage: 'State'
  },
  streamStateOptionactive: {
    id: 'stream.field.state.option.active',
    description: 'Stream State Active',
    defaultMessage: 'Active'
  },
  streamStateOptionsleep: {
    id: 'stream.field.state.option.sleep',
    description: 'Stream State Sleep',
    defaultMessage: 'Sleep'
  },
  streamStateOptioninactive: {
    id: 'stream.field.state.option.inactive',
    description: 'Stream State Inactive',
    defaultMessage: 'Inactive'
  },
  streamFieldRefreshLabel: {
    id: 'stream.field.refresh.label',
    description: 'Stream Refresh label',
    defaultMessage: 'Refresh'
  },
  streamFieldGroupsLabel: {
    id: 'stream.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
  streamFieldOwnerLabel: {
    id: 'stream.field.owner.label',
    description: 'Owner label',
    defaultMessage: 'Owner'
  },
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
  saved: {
    id: 'stream.saved.notify',
    description: 'Saved user notification',
    defaultMessage: 'Stream has been saved'
  },
  deletedSuccess: {
    id: 'stream.deleted.notify',
    description: 'Info that groups has beed deleted',
    defaultMessage: 'Group has beed deleted.'
  }
});

const getSelected = function (data) {
  let i;
  let selected = [];
  for (i in data) {
    if (data[i].selected) {
      selected.push(data[i].value);
    }
  }
  return selected;
};

class StreamCreate extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      definition: {
        state: {
          enum: []
        },
        refresh: {
          enum: []
        }
      },
      state: '',
      refresh: 0,
      name: '',
      uniquename: '',
      groups: null,
      owner: null,

      bsStyle_name: null,
      bsStyle_uniquename: null,
      bsStyle_groups: null,
      bsStyle_owner: null,

      stream: null,
      edit: false,
      allow: true
    };
    this._bind('_save', '_remove', '_update', 'load', '_handleStateChange', '_handleRefreshChange', '_handleNameChange', '_handleGroupsChange', '_handleOwnerChange', '_handleUniqueNameChange', 'handleCanCreate', 'handleDefinition', 'handleGroups', 'handleUsers', 'handleSaveResponse', 'handleLoad', 'handleCanModify', 'handleDestroyResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    this.load();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.streamId !== this.props.params.streamId) {
      this.setState({stream: null, status: 0, error: null});
      this.load(nextProps);
    }
  }

  handleCanCreate(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({allow: true});
    } else {
      this.setState({allow: false});
    }
  }

  handleCanModify(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({allow: true, edit: true});
      let {socket} = this.context;
      let query = {
        populate: 'owner,groups'
      };
      socket.get('/streams/' + this.props.params.streamId, query, this.handleLoad);
    } else {
      this.setState({allow: false});
    }
  }
  
  load(nextProps) {
    if (!this._isMounted) {
      return;
    }
    let {socket} = this.context;
    let roles = this.context.user.roles;
    let streamId = this.props.params.streamId;
    if (nextProps) {
      streamId = nextProps.params.streamId;
    }
    let isAdmin = function () {
      let i;
      for (i in roles) {
        if (roles[i].name == 'admin') {
          return true;
        };
      };
      return false;
    };
    if (isAdmin()) {
      socket.get('/groups', {
        sort: 'name'
      }, this.handleGroups);
    } else {
      socket.get('/users/' + this.context.user.id + '/groups', {
        sort: 'name'
      }, this.handleGroups);
    }
    socket.get('/streams/definition', this.handleDefinition);
    if (streamId >= 0) {
      socket.get('/streams/canmodify/' + streamId, this.handleCanModify);
    } else {
      socket.get('/streams/cancreate', this.handleCanCreate);
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      let i;
      let owner = [];
      let groups = [];
      if (this.state.owner == null && data.owner) {
        owner.push({value: data.owner.id, label: data.owner.name, selected: true});
      } else {
        owner = this.state.owner;
        let j;
        for (j in owner) {
          if (owner[j].value == data.owner.id) {
            owner[j].selected = true;
          } else {
            owner[j].selected = false;
          }
        }
      }

      for (i in data.groups) {
        groups.push({value: data.groups[i].id, label: data.groups[i].name, selected: true});
      }
      if (this.state.groups) {
        groups = _.unionBy(this.state.groups, groups, 'value');
      }
      for (i in data.groups) {
        let j;
        for (j in groups) {
          if (groups[j].value == data.groups[i].id) {
            groups[j].selected = true;
          };
        }
      }

      this.setState({
        status: res.statusCode,
        user: data,
        state: data.state,
        refresh: data.refresh,
        name: data.name,
        uniquename: data.uniqueName,
        owner: owner,
        groups: groups,
        error: null,
        edit: true
      });
      this.refs.owner.syncData();
      this.refs.groups.syncData();
    } else {
      this.setState({status: res.statusCode, error: res.body, stream: null});
    }
  }

  handleDefinition(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (data.state !== undefined) {
      this.setState({definition: data, state: data.state.defaultsTo, refresh: data.refresh.defaultsTo});
    }
  }

  handleGroups(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return;
    }
    let selected = getSelected(this.state.groups);
    let groups = [];
    let i;
    for (i in data) {
      let group = data[i];
      socket.get('/groups/' + group.id + '/users', {
        sort: 'name'
      }, this.handleUsers);
      groups.push({
        value: group.id,
        label: group.name,
        selected: (_.indexOf(selected, group.id) > -1)
      });
    }
    this.setState({groups: groups});
    if (this.refs.groups) {
      this.refs.groups.syncData();
    }
  }

  handleUsers(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return;
    }
    let selected = getSelected(this.state.owner);
    if (selected.length == 0) {
      selected.push(this.context.user.id);
    }
    let users = [];
    let i;
    for (i in data) {
      let user = data[i];
      users.push({
        value: user.id,
        label: user.username,
        selected: (_.indexOf(selected, user.id) > -1)
      });
    }
    let u = _.union(this.state.owner, users);
    u = _.uniqBy(u, 'value');
    this.setState({owner: u});
    if (this.refs.owner) {
      this.refs.owner.syncData();
    }
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/streams', {
        name: this.state.name,
        uniqueName: this.state.uniquename,
        state: this.state.state,
        refresh: this.state.refresh,
        groups: getSelected(this.state.groups),
        owner: getSelected(this.state.owner)[0],
        _csrf: _csrf
      }, this.handleSaveResponse);
    }
  }

  _update() {
    let {socket} = this.context;
    if (this._validateAll()) {
      let payload = {
        name: this.state.name,
        uniqueName: this.state.uniquename,
        state: this.state.state,
        refresh: this.state.refresh,
        _csrf: _csrf
      };
      if (this.context.user.permissions.stream.group.u) {
        payload.owner = getSelected(this.state.owner)[0];
      }
      if (this.context.user.permissions.stream.group.u) {
        payload.groups = getSelected(this.state.groups);
      }
      socket.put('/streams/' + this.props.params.streamId, payload, this.handleSaveResponse);
    }
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.delete('/streams/' + this.props.params.streamId, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  _validateAll() {
    let ok = true;
    if (this.state.name.length == 0) {
      this.setState({bsStyle_name: 'error'});
      ok = false;
    } else {
      this.setState({bsStyle_name: 'success'});
    }
    return ok;
  }

  handleDestroyResponse(data, res) {
    const {formatMessage} = this.props.intl;
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true});
      notify.show(formatMessage(messages.deletedSuccess), 'success');
      this.props.history.goBack();
    } else {
      notify.show(res.body, 'error');
    }
  }

  handleSaveResponse(data, res) {
    const {formatMessage} = this.props.intl;
    if (res.statusCode == 500) {
      notify.show('Error 500', 'error');
      return;
    }
    if (res.statusCode == 403) {
      notify.show(res.body, 'error');
      return;
    }

    if (data.code == 'E_VALIDATION') {
      this.setState({error: data.details});
    } else if (data.id != undefined) {
      notify.show(formatMessage(messages.saved), 'success');
      this.setState({error: null});
      let id = data.id;
      this.props.history.push('/stream/' + id);
    }
  }

  _handleStateChange(event) {
    this.setState({state: event.target.value});
  }

  _handleRefreshChange(event) {
    this.setState({refresh: event.target.value});
  }

  _handleNameChange(event) {
    let s = event.target.value.split(' ').join('_').toLowerCase();
    this.setState({name: event.target.value, uniquename: s});
  }

  _handleUniqueNameChange(event) {
    this.setState({uniquename: event.target.value});
  }

  _handleGroupsChange(event) {
    let val = event.context.value;
    let sel = event.context.selected;
    let i;
    let groups = [];
    for (i in this.state.groups) {
      groups[i] = this.state.groups[i];
      if (groups[i].value == val) {
        groups[i].selected = sel;
      }
    }
    this.setState({groups: groups});
  }

  _handleOwnerChange(event) {
    let val = event.context.value;
    let sel = event.context.selected;
    let i;
    let owner = [];
    for (i in this.state.owner) {
      owner[i] = this.state.owner[i];
      if (owner[i].value == val) {
        owner[i].selected = sel;
      } else {
        owner[i].selected = false;
      }
    }
    this.setState({owner: owner});
  }

  render() {
    const {formatMessage} = this.props.intl;

    if (!this.state.allow) {
      return (<Forbidden/>);
    }

    let errorMessage = null;
    if (this.state.error != null) {
      errorMessage = <Alert bsStyle="danger">
        <p>{this.state.error}</p>
      </Alert>;
    }

    let fieldName = <Input type="text" label={formatMessage(messages.streamFieldNameLabel)} placeholder={formatMessage(messages.streamFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.name} onChange={this._handleNameChange} ref="name" bsStyle={this.state.bsStyle_name}></Input>;

    let fieldUniqueName = <Input type="text" label={formatMessage(messages.streamFieldUniqueNameLabel)} placeholder={formatMessage(messages.streamFieldUniqueNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.uniquename} onChange={this._handleUniqueNameChange} ref="name" bsStyle={this.state.bsStyle_uniquename}></Input>;

    let fieldState = <Input type="select" label={formatMessage(messages.streamFieldStateLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.state} onChange={this._handleStateChange}>
      {_.map(this.state.definition.state.enum, function (val) {
        return <option value={val} key={val}>
          {formatMessage(messages['streamStateOption' + val])}
        </option>;
      })}
    </Input>;

    let fieldRefresh = <Input type="select" label={formatMessage(messages.streamFieldRefreshLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.refresh} onChange={this._handleRefreshChange}>
      {_.map(this.state.definition.refresh.enum, function (val) {
        return <option value={val} key={val}>{val}</option>;
      })}
    </Input>;

    let groupsClass = 'form-group has-feedback ' + this.state.bsStyle_groups;
    let fieldGroups = <div className={groupsClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.streamFieldGroupsLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleGroupsChange} data={this.state.groups} multiple ref="groups"/>
      </div>
    </div>;

    let ownerClass = 'form-group has-feedback ' + this.state.bsStyle_owner;
    let fieldOwner = <div className={ownerClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.streamFieldOwnerLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleOwnerChange} data={this.state.owner} ref="owner"/>
      </div>
    </div>;

    let create = null;
    let update = null;
    let remove = null;
    let title = null;

    if (this.state.edit) {
      update = this._update;
      remove = this._remove;
      title = <FormattedMessage {...messages.streamEditTitle}/>;
    } else {
      create = this._save;
      title = <FormattedMessage {...messages.streamTitle}/>;
    }

    return (
      <Row>
        <PageHeader>
          {title}
        </PageHeader>
        <Col xs={12}>
          {errorMessage}
          <form className="form-horizontal">
            {fieldName}
            {fieldUniqueName}
            {fieldState}
            {fieldRefresh}
            {fieldGroups}
            {fieldOwner}
          </form>
          <EditToolbar create={create} update={update} remove={remove}/>
        </Col>
      </Row>
    );
  }
}

StreamCreate.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(StreamCreate);