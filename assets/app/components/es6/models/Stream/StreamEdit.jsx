import {Component, PropTypes} from 'react';
import {
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
  streamFieldNamePlaceholder: {
    id: 'stream.field.name.placeholder',
    description: 'Stream Name placeholder',
    defaultMessage: 'Stream Name'
  },
  streamFieldNameLabel: {
    id: 'stream.field.label.name',
    description: 'Stream Name label',
    defaultMessage: 'Name'
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
      groups: null,
      owner: null,

      bsStyle_name: null,
      bsStyle_groups: null,
      bsStyle_owner: null,

      stream: null,
      edit: false,
      allow: true
    };
    this._bind('_save', '_remove', '_update', '_handleStateChange', '_handleRefreshChange', '_handleNameChange', 'handleCanCreate', 'handleDefinition', 'handleGroups', 'handleUsers');
  }

  componentDidMount() {
    this._isMounted = true;
    let {socket} = this.context;
    let roles = this.context.user.roles;
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
    if (this.props.params.userId >= 0) {
      socket.get('/streams/canmodify' + this.props.params.streamId, this.handleCanModify);
    } else {
      socket.get('/streams/cancreate', this.handleCanCreate);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
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
      socket.get('/groups/' + this.props.params.userId, this.handleLoad);
    } else {
      this.setState({allow: false});
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
    this.refs.groups.syncData();
  }

  handleUsers(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return;
    }
    let selected = getSelected(this.state.owner);
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
    this.refs.owner.syncData();
  }

  _save() {
    let {socket} = this.context;
    if (this.state.name.length == 0) {
      this.setState({nameBsStyle: 'error'});
    } else {
      this.setState({nameBsStyle: 'success'});
    }
  }

  _update() {}

  _remove() {}

  _handleStateChange(event) {
    this.setState({state: event.target.value});
  }

  _handleRefreshChange(event) {
    this.setState({refresh: event.target.value});
  }

  _handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  render() {
    const {formatMessage} = this.props.intl;

    if (!this.state.allow) {
      return (<Forbidden/>);
    }

    let fieldName = <Input type="text" label={formatMessage(messages.streamFieldNameLabel)} placeholder={formatMessage(messages.streamFieldNamePlaceholder)} hasFeedback labelClassName="col-xs-12 col-sm-2" wrapperClassName="col-xs-12 col-sm-5" value={this.state.name} onChange={this._handleNameChange} ref="name" bsStyle={this.state.bsStyle_name}></Input>;

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
        <Multiselect onChange={this._handleGroupsChange} data={this.state.owner} ref="owner"/>
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
          <form className="form-horizontal">
            {fieldName}
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