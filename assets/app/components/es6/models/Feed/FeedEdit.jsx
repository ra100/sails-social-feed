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
  feedTitle: {
    id: 'feed.new.title',
    description: 'Title of Create feed page',
    defaultMessage: 'Create New Feed'
  },
  feedEditTitle: {
    id: 'feed.edit.title',
    description: 'Title of Edit feed page',
    defaultMessage: 'Edit feed'
  },
  feedFieldNamePlaceholder: {
    id: 'feed.field.name.placeholder',
    description: 'Feed Name placeholder',
    defaultMessage: 'Feed Name'
  },
  feedFieldNameLabel: {
    id: 'feed.field.name.label',
    description: 'Feed Name label',
    defaultMessage: 'Name'
  },
  feedFieldConfigPlaceholder: {
    id: 'feed.field.config.placeholder',
    description: 'Feed Extra config placeholder',
    defaultMessage: 'ID/hashtag/name/...'
  },
  feedFieldConfigLabel: {
    id: 'feed.field.config.label',
    description: 'Feed Config label',
    defaultMessage: 'Source ID'
  },
  feedFieldTypePlaceholder: {
    id: 'feed.field.type.placeholder',
    description: 'Feed Type placeholder',
    defaultMessage: 'Select type'
  },
  feedFieldTypeLabel: {
    id: 'feed.field.type.label',
    description: 'Feed Type label',
    defaultMessage: 'Type'
  },
  feedFieldStreamLabel: {
    id: 'feed.field.stream.label',
    description: 'Feed Stream label',
    defaultMessage: 'Stream'
  },
  feedFieldGroupsLabel: {
    id: 'feed.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
  feedFieldOwnerLabel: {
    id: 'feed.field.owner.label',
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
    id: 'feed.saved.notify',
    description: 'Saved user notification',
    defaultMessage: 'Feed has been saved'
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

class FeedCreate extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      definition: {
        type: {
          enum: []
        }
      },

      name: '',
      type: '',
      config: '',
      stream: [],
      groups: [],
      owner: [],

      bsStyle: {
        name: null,
        type: null,
        config: null,
        stream: '',
        groups: '',
        owner: ''
      },

      feed: null,
      edit: false,
      allow: true,
      view: false
    };
    this._bind('_save', '_remove', '_update', '_handleTypeChange', '_handleNameChange', '_handleGroupsChange', '_handleOwnerChange', '_handleConfigChange', '_handleStreamChange', 'handleCanCreate', 'handleDefinition', 'handleGroups', 'handleStreams', 'handleUsers', 'handleSaveResponse', 'handleLoad', 'handleCanModify', 'handleDestroyResponse', 'load');
  }

  componentDidMount() {
    this._isMounted = true;
    this.load();
  }

  load(nextProps) {
    if (!this._isMounted) {
      return;
    }
    let {socket} = this.context;
    let roles = this.context.user.roles;
    let feedId = this.props.params.feedId;
    if (nextProps) {
      feedId = nextProps.params.feedId;
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
      socket.get('/streams', {
        sort: 'name'
      }, this.handleStreams);
    } else {
      socket.get('/users/' + this.context.user.id + '/groups', {
        sort: 'name'
      }, this.handleGroups);
      socket.get('/users/' + this.context.user.id + '/streams', {
        sort: 'name'
      }, this.handleStreams);
    }
    socket.get('/feeds/definition', this.handleDefinition);
    if (feedId >= 0) {
      socket.get('/feeds/canmodify/' + feedId, this.handleCanModify);
    } else {
      socket.get('/feeds/cancreate', this.handleCanCreate);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.socket.get('/feeds/unsubscribe');
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
        populate: 'owner,groups,stream'
      };
      socket.get('/feeds/' + this.props.params.feedId, query, this.handleLoad);
    } else {
      this.setState({allow: true, view: true});
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      let i;
      let owner = [];
      let stream = [];
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

      if (this.state.stream == null && data.stream) {
        stream.push({value: data.stream.id, label: data.stream.name, selected: true});
      } else {
        stream = this.state.stream;
        let j;
        for (j in stream) {
          if (stream[j].value == data.stream.id) {
            stream[j].selected = true;
          } else {
            stream[j].selected = false;
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
        feed: data,
        type: data.type,
        name: data.name,
        config: data.config,
        stream: stream,
        owner: owner,
        groups: groups,
        error: null,
        edit: true
      });
      this.refs.owner.syncData();
      this.refs.groups.syncData();
    } else {
      this.setState({status: res.statusCode, error: res.body, feed: null});
    }
  }

  handleDefinition(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (data.type !== undefined) {
      this.setState({definition: data});
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

  handleStreams(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return;
    }
    let selected = getSelected(this.state.stream);
    let streams = [];
    let i;
    for (i in data) {
      let stream = data[i];
      streams.push({
        value: stream.id,
        label: [stream.name, ' ', '[', stream.uniqueName, ']'].join(''),
        selected: (_.indexOf(selected, stream.id) > -1)
      });
    }
    let s = _.unionBy(this.state.stream, streams, 'value');
    this.setState({stream: s});
    if (this.refs.stream) {
      this.refs.stream.syncData();
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
    let u = _.unionBy(this.state.owner, users, 'value');
    this.setState({owner: u});
    if (this.refs.owner) {
      this.refs.owner.syncData();
    }
  }

  _save() {
    let {socket} = this.context;
    if (this._validateAll()) {
      socket.post('/feeds/create', {
        name: this.state.name,
        type: this.state.type,
        config: this.state.config,
        stream: getSelected(this.state.stream)[0],
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
        type: this.state.type,
        config: this.state.config,
        _csrf: _csrf
      };
      if (this.context.user.permissions.feed.group.u) {
        payload.owner = getSelected(this.state.owner)[0];
      }
      if (this.context.user.permissions.feed.group.u) {
        payload.groups = getSelected(this.state.groups);
      }
      if (this.context.user.permissions.feed.group.u) {
        payload.stream = getSelected(this.state.stream)[0];
      }
      socket.post('/feeds/update/' + this.props.params.feedId, payload, this.handleSaveResponse);
    }
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.post('/feeds/destroy/' + this.props.params.feedId, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  _validateAll() {
    let ok = true;
    let bs = this.state.bsStyle;
    _.forEach([
      'name', 'type', 'config'
    ], function (field, key) {
      if (this.state[field] == null || this.state[field].length == 0) {
        bs[field] = 'error';
        ok = false;
      } else {
        bs[field] = 'success';
      }
    }.bind(this));
    _.forEach([
      'stream', 'owner', 'groups'
    ], function (field, key) {
      if (this.state[field] == null || getSelected(this.state[field]) == 0) {
        bs[field] = 'has-error';
        ok = false;
      } else {
        bs[field] = 'has-success';
      }
    }.bind(this));
    this.setState({bsStyle: bs});
    return ok;
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
      this.props.history.push('/feed/' + id);
    }
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

  _handleTypeChange(event) {
    this.setState({type: event.target.value});
  }

  _handleConfigChange(event) {
    this.setState({config: event.target.value});
  }

  _handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  _handleStreamChange(event) {
    let val = event.context.value;
    let sel = event.context.selected;
    let i;
    let stream = [];
    for (i in this.state.stream) {
      stream[i] = this.state.stream[i];
      if (stream[i].value == val) {
        stream[i].selected = sel;
      } else {
        stream[i].selected = false;
      }
    }
    this.setState({stream: stream});
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

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.load(nextProps);
    }
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

    let fieldName = <Input type="text" label={formatMessage(messages.feedFieldNameLabel)} placeholder={formatMessage(messages.feedFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.name} onChange={this._handleNameChange} ref="name" bsStyle={this.state.bsStyle.name}></Input>;

    let fieldConfig = <Input type="text" label={formatMessage(messages.feedFieldConfigLabel)} placeholder={formatMessage(messages.feedFieldConfigPlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.config} onChange={this._handleConfigChange} ref="config" bsStyle={this.state.bsStyle.config}></Input>;

    let fieldType = <Input type="select" label={formatMessage(messages.feedFieldTypeLabel)} labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.type} onChange={this._handleTypeChange} bsStyle={this.state.bsStyle.type}>
      <option value="">{formatMessage(messages.feedFieldTypePlaceholder)}</option>
      {_.map(this.state.definition.type.enum, function (val) {
        return <option value={val} key={val}>{val}</option>;
      })}
    </Input>;

    let streamClass = 'form-group has-feedback ' + this.state.bsStyle.stream;
    let fieldStream = <div className={streamClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.feedFieldStreamLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleStreamChange} data={this.state.stream} ref="stream"/>
      </div>
    </div>;

    let groupsClass = 'form-group has-feedback ' + this.state.bsStyle.groups;
    let fieldGroups = <div className={groupsClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.feedFieldGroupsLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleGroupsChange} data={this.state.groups} multiple ref="groups"/>
      </div>
    </div>;

    let ownerClass = 'form-group has-feedback ' + this.state.bsStyle.owner;
    let fieldOwner = <div className={ownerClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.feedFieldOwnerLabel}/>
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
      title = <FormattedMessage {...messages.feedEditTitle}/>;
    } else {
      create = this._save;
      title = <FormattedMessage {...messages.feedTitle}/>;
    }

    if (this.state.view) {
      update = null;
      create = null;
      remove = null;
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
            {fieldType}
            {fieldConfig}
            {fieldStream}
            {fieldGroups}
            {fieldOwner}
          </form>
          <EditToolbar create={create} update={update} remove={remove}/>
        </Col>
      </Row>
    );
  }
}

FeedCreate.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(FeedCreate);