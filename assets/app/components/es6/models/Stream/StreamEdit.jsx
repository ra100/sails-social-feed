import {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Col,
  Row,
  Grid,
  FormGroup,
  ControlLabel,
  FormControl,
  PageHeader,
  ButtonToolbar,
  Checkbox
} from 'react-bootstrap'
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl'
import Forbidden from './../../Forbidden'
import EditToolbar from './../../EditToolbar'
import {notify} from 'react-notify-toast'
import Multiselect from 'react-bootstrap-multiselect'
import _ from 'lodash/core'
import array from 'lodash/array'

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
  streamFieldDisplayLabel: {
    id: 'stream.field.display.label',
    description: 'Stream Display label',
    defaultMessage: 'Show unreviewed'
  },
  streamFieldPublishedLabel: {
    id: 'stream.field.published.label',
    description: 'Stream Published label',
    defaultMessage: 'Published'
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
})

const getSelected = function (data) {
  let i
  let selected = []
  for (i in data) {
    if (data[i].selected) {
      selected.push(data[i].value)
    }
  }
  return selected
}

class StreamEdit extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this))
  }

  constructor(props, context) {
    super(props, context)
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
      published: false,
      display: false,
      groups: null,
      owner: null,

      bsStyle_name: null,
      bsStyle_uniquename: null,
      bsStyle_groups: null,
      bsStyle_owner: null,

      stream: null,
      edit: false,
      allow: true
    }
    this._bind('_save', '_remove', '_update', 'load', '_handleStateChange', '_handleRefreshChange', '_handleNameChange', '_handleGroupsChange', '_handleOwnerChange', '_handlePublishedChange', '_handleDisplayChange', '_handleUniqueNameChange', 'handleCanCreate', 'handleDefinition', 'handleGroups', 'handleUsers', 'handleSaveResponse', 'handleLoad', 'handleCanModify', 'handleDestroyResponse')
  }

  componentDidMount() {
    this._isMounted = true
    this.load()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.context.socket.get('/streams/unsubscribe')
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.streamId !== this.props.match.params.streamId) {
      this.setState({stream: null, status: 0, error: null})
      this.load(nextProps)
    }
  }

  handleCanCreate(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.statusCode == 200) {
      this.setState({allow: true})
    } else {
      this.setState({allow: false})
    }
  }

  handleCanModify(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.statusCode == 200) {
      this.setState({allow: true, edit: true})
      let {socket} = this.context
      let query = {
        populate: 'owner,groups'
      }
      socket.get('/streams/' + this.props.match.params.streamId, query, this.handleLoad)
    } else {
      this.setState({allow: false})
    }
  }

  load(nextProps) {
    if (!this._isMounted) {
      return
    }
    let {socket} = this.context
    let roles = this.context.user.roles
    let streamId = this.props.match.params.streamId
    if (nextProps) {
      streamId = nextProps.match.params.streamId
    }
    let isAdmin = function () {
      let i
      for (i in roles) {
        if (roles[i].name == 'admin') {
          return true
        };
      };
      return false
    }
    if (isAdmin()) {
      socket.get('/groups', {
        sort: 'name'
      }, this.handleGroups)
    } else {
      socket.get('/users/' + this.context.user.id + '/groups', {
        sort: 'name'
      }, this.handleGroups)
    }
    socket.get('/streams/definition', this.handleDefinition)
    if (typeof streamId !== 'undefined') {
      socket.get('/streams/canmodify/' + streamId, this.handleCanModify)
    } else {
      socket.get('/streams/cancreate', this.handleCanCreate)
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.statusCode == 200) {
      let i
      let owner = []
      let groups = []
      if (this.state.owner.length == 0 && data.owner) {
        owner.push({value: data.owner.id, label: data.owner.username, selected: true})
      } else {
        owner = this.state.owner
        let j
        for (j in owner) {
          if (owner[j].value == data.owner.id) {
            owner[j].selected = true
          } else {
            owner[j].selected = false
          }
        }
      }

      for (i in data.groups) {
        groups.push({value: data.groups[i].id, label: data.groups[i].name, selected: true})
      }
      if (this.state.groups) {
        groups = array.unionBy(this.state.groups, groups, 'value')
      }
      for (i in data.groups) {
        let j
        for (j in groups) {
          if (groups[j].value == data.groups[i].id) {
            groups[j].selected = true
          };
        }
      }

      this.setState({
        status: res.statusCode,
        user: data,
        state: data.state,
        refresh: data.refresh,
        published: data.published,
        display: data.display,
        name: data.name,
        uniquename: data.uniqueName,
        owner: owner,
        groups: groups,
        error: null,
        edit: true
      })
      this.refs.owner.syncData()
      this.refs.groups.syncData()
    } else {
      this.setState({status: res.statusCode, error: res.body, stream: null})
    }
  }

  handleDefinition(data, res) {
    if (!this._isMounted) {
      return
    }
    if (data.state !== undefined) {
      this.setState({definition: data, state: data.state.defaultsTo, refresh: data.refresh.defaultsTo})
    }
  }

  handleGroups(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return
    }
    let selected = getSelected(this.state.groups)
    let groups = []
    let i
    for (i in data) {
      let group = data[i]
      socket.get('/groups/' + group.id + '/users', {
        sort: 'name'
      }, this.handleUsers)
      groups.push({
        value: group.id,
        label: group.name,
        selected: (_.indexOf(selected, group.id) > -1)
      })
    }
    this.setState({groups: groups})
    if (this.refs.groups) {
      this.refs.groups.syncData()
    }
  }

  handleUsers(data, res) {
    if (!this._isMounted || res.statusCode !== 200) {
      return
    }
    let selected = getSelected(this.state.owner)
    if (selected.length == 0) {
      selected.push(this.context.user.id)
    }
    let users = []
    let i
    for (i in data) {
      let user = data[i]
      users.push({
        value: user.id,
        label: user.username,
        selected: (_.indexOf(selected, user.id) > -1)
      })
    }
    let u = array.union(this.state.owner, users)
    u = array.uniqBy(u, 'value')
    this.setState({owner: u})
    if (this.refs.owner) {
      this.refs.owner.syncData()
    }
  }

  _save() {
    let {socket} = this.context
    if (this._validateAll()) {
      socket.post('/streams', {
        name: this.state.name,
        uniqueName: this.state.uniquename,
        state: this.state.state,
        refresh: this.state.refresh,
        published: this.state.published,
        display: this.state.display,
        groups: getSelected(this.state.groups),
        owner: getSelected(this.state.owner)[0],
        _csrf: _csrf
      }, this.handleSaveResponse)
    }
  }

  _update() {
    let {socket} = this.context
    if (this._validateAll()) {
      let payload = {
        name: this.state.name,
        uniqueName: this.state.uniquename,
        state: this.state.state,
        published: this.state.published,
        display: this.state.display,
        refresh: this.state.refresh,
        _csrf: _csrf
      }
      if (this.context.user.permissions.stream.group.u) {
        payload.owner = getSelected(this.state.owner)[0]
      }
      if (this.context.user.permissions.stream.group.u) {
        payload.groups = getSelected(this.state.groups)
      }
      socket.put('/streams/' + this.props.match.params.streamId, payload, this.handleSaveResponse)
    }
  }

  _remove() {
    let {socket} = this.context
    if (!this.state.deleted) {
      socket.delete('/streams/' + this.props.match.params.streamId, {
        _csrf: _csrf
      }, this.handleDestroyResponse)
    }
  }

  _validateAll() {
    let ok = true
    if (this.state.name.length == 0) {
      this.setState({bsStyle_name: 'error'})
      ok = false
    } else {
      this.setState({bsStyle_name: 'success'})
    }
    return ok
  }

  handleDestroyResponse(data, res) {
    const {formatMessage} = this.props.intl
    if (!this._isMounted) {
      return
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true})
      notify.show(formatMessage(messages.deletedSuccess), 'success')
      this.context.history.goBack()
    } else {
      notify.show(res.body, 'error')
    }
  }

  handleSaveResponse(data, res) {
    const {formatMessage} = this.props.intl
    if (res.statusCode == 500) {
      notify.show('Error 500', 'error')
      return
    }
    if (res.statusCode == 403) {
      notify.show(res.body, 'error')
      return
    }

    if (data.code == 'E_VALIDATION') {
      this.setState({error: data.details})
    } else if (data.id != undefined) {
      notify.show(formatMessage(messages.saved), 'success')
      this.setState({error: null})
      let id = data.id
      this.context.history.push('/stream/' + id)
    }
  }

  _handleStateChange(event) {
    this.setState({state: event.target.value})
  }

  _handleRefreshChange(event) {
    this.setState({refresh: event.target.value})
  }

  _handlePublishedChange(event) {
    this.setState({published: this.refs.published.checked})
  }

  _handleDisplayChange(event) {
    this.setState({display: this.refs.display.checked})
  }

  _handleNameChange(event) {
    let s = event.target.value.split(' ').join('_').toLowerCase()
    this.setState({name: event.target.value, uniquename: s})
  }

  _handleUniqueNameChange(event) {
    this.setState({uniquename: event.target.value})
  }

  _handleGroupsChange(event) {
    let val = event[0].value
    let sel = event[0].selected
    let i
    let groups = []
    for (i in this.state.groups) {
      groups[i] = this.state.groups[i]
      if (groups[i].value == val) {
        groups[i].selected = sel
      }
    }
    this.setState({groups: groups})
  }

  _handleOwnerChange(event) {
    let val = event[0].value
    let sel = event[0].selected
    let i
    let owner = []
    for (i in this.state.owner) {
      owner[i] = this.state.owner[i]
      if (owner[i].value == val) {
        owner[i].selected = sel
      } else {
        owner[i].selected = false
      }
    }
    this.setState({owner: owner})
  }

  render() {
    const {formatMessage} = this.props.intl

    if (!this.state.allow) {
      return (<Forbidden/>)
    }

    let errorMessage = null
    if (this.state.error != null) {
      errorMessage = <Alert bsStyle="danger">
        <p>{this.state.error}</p>
      </Alert>
    }

    let fieldName = <FormGroup controlId="name" validationState={this.state.bsStyle_name} className="col-xs-12">
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.streamFieldNameLabel)}</ControlLabel>
      <Col sm={5} xs={12}>
        <FormControl type="text" placeholder={formatMessage(messages.streamFieldNamePlaceholder)} value={this.state.name} onChange={this._handleNameChange} ref="name"/>
        <FormControl.Feedback/>
      </Col>
    </FormGroup>

    let fieldUniqueName = <FormGroup controlId="uniquename" className="col-xs-12" validationState={this.state.bsStyle_uniquename}>
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.streamFieldUniqueNameLabel)}</ControlLabel>
      <Col sm={5} xs={12}>
        <FormControl type="text" placeholder={formatMessage(messages.streamFieldUniqueNamePlaceholder)} value={this.state.uniquename} onChange={this._handleUniqueNameChange} ref="name"/>
      </Col>
      <FormControl.Feedback/>
    </FormGroup>

    let fieldState = <FormGroup controlId="state" className="col-xs-12">
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.streamFieldStateLabel)}</ControlLabel>
      <Col sm={5} xs={12}>
        <FormControl componentClass="select" value={this.state.state} onChange={this._handleStateChange}>
          {this.state.definition.state.enum.map(function (val, i) {
            return <option value={val} key={i}>
              {formatMessage(messages['streamStateOption' + val])}
            </option>
          })}
        </FormControl>
      </Col>
    </FormGroup>

    let fieldRefresh = null
    if (this.state.definition.refresh.enum.length > 0) {
      fieldRefresh = <FormGroup controlId="refresh" className="col-xs-12">
        <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.streamFieldRefreshLabel)}</ControlLabel>
        <Col sm={5} xs={12}>
          <FormControl componentClass="select" value={this.state.refresh} onChange={this._handleStateChange}>
            {this.state.definition.refresh.enum.map(function (val, i) {
              return <option value={Number(val).toString()} key={i}>{Number(val).toString()}</option>
            })}
          </FormControl>
        </Col>
      </FormGroup>
    }

    let groupsClass = 'col-xs-12 form-group has-feedback ' + this.state.bsStyle_groups
    let fieldGroups = <div className={groupsClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.streamFieldGroupsLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleGroupsChange} data={this.state.groups} multiple ref="groups"/>
      </div>
    </div>

    let ownerClass = 'col-xs-12 form-group has-feedback ' + this.state.bsStyle_owner
    let fieldOwner = <div className={ownerClass}>
      <label className="control-label col-xs-12 col-sm-2">
        <FormattedMessage {...messages.streamFieldOwnerLabel}/>
      </label>
      <div className="col-xs-12 col-sm-5">
        <Multiselect onChange={this._handleOwnerChange} data={this.state.owner} ref="owner"/>
      </div>
    </div>

    let fieldPublished = <FormGroup controlId="published" className="col-xs-12">
      <ControlLabel className="col-xs-12 col-sm-2"><FormattedMessage {...messages.streamFieldPublishedLabel}/></ControlLabel>
      <Checkbox onChange={this._handlePublishedChange} checked={this.state.published} inputRef={(ref) => {this.refs.published = ref}}></Checkbox>
    </FormGroup>

    let fieldDisplay = <FormGroup controlId="display" className="col-xs-12">
      <ControlLabel className="col-xs-12 col-sm-2"><FormattedMessage {...messages.streamFieldDisplayLabel}/></ControlLabel>
      <Checkbox onChange={this._handleDisplayChange} checked={this.state.display} inputRef={(ref) => {this.refs.display = ref}}></Checkbox>
    </FormGroup>

    let create = null
    let update = null
    let remove = null
    let title = null
    if (this.state.edit) {
      update = this._update
      remove = this._remove
      title = <FormattedMessage {...messages.streamEditTitle}/>
    } else {
      create = this._save
      title = <FormattedMessage {...messages.streamTitle}/>
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
            {fieldDisplay}
            {fieldPublished}
            {fieldRefresh}
            {fieldGroups}
            {fieldOwner}
          </form>
          <EditToolbar create={create} update={update} remove={remove}/>
        </Col>
      </Row>
    )
  }
}

StreamEdit.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

export default injectIntl(StreamEdit)
