import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Col,
  Row,
  Grid,
  Button,
  FormControl,
  FormGroup,
  ControlLabel,
  PageHeader,
  ButtonToolbar,
  Alert
} from 'react-bootstrap'
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl'
import Forbidden from './../../Forbidden'
import EditToolbar from './../../EditToolbar'
import {notify} from 'react-notify-toast'
import _ from 'lodash/core'

const messages = defineMessages({
  groupTitle: {
    id: 'group.new.title',
    description: 'Title of Create group page',
    defaultMessage: 'Create New Group'
  },
  groupEditTitle: {
    id: 'group.edit.title',
    description: 'Title of Edit group page',
    defaultMessage: 'Edit Group'
  },
  groupFieldNamePlaceholder: {
    id: 'group.field.name.placeholder',
    description: 'Group Name placeholder',
    defaultMessage: 'Group Name'
  },
  groupFieldNameLabel: {
    id: 'group.field.label.name',
    description: 'Group Name label',
    defaultMessage: 'Group'
  },
  saved: {
    id: 'group.saved.notify',
    description: 'Saved group notification',
    defaultMessage: 'Group has been saved'
  },
  deletedSuccess: {
    id: 'group.deleted.notify',
    description: 'Info that groups has beed deleted',
    defaultMessage: 'Group has beed deleted.'
  }
})

class GroupEdit extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      bsStyle: {
        name: null
      },
      group: {
        name: ''
      },
      edit: false,
      error: null,
      allow: true
    }
    this._bind('_save', '_update', '_remove', 'load', '_handleNameChange', '_validateAll', 'handleSaveResponse', 'handleCanCreate', 'handleCanModify', 'handleLoad', 'handleDestroyResponse')
  }

  componentDidMount() {
    this._isMounted = true
    this.load()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.context.socket.get('/groups/unsubscribe')
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.groupId !== this.props.match.params.groupId) {
      this.setState({group: null, status: 0, error: null})
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
      socket.get('/groups/' + this.props.match.params.groupId, this.handleLoad)
    } else {
      this.setState({allow: false})
    }
  }

  load(nextProps) {
    if (!this._isMounted) {
      return
    }
    let {socket} = this.context
    let groupId = this.props.match.params.groupId
    if (nextProps) {
      groupId = nextProps.match.params.groupId
    }
    if (typeof groupId !== 'undefined') {
      socket.get('/groups/canmodify/' + groupId, this.handleCanModify)
    } else {
      socket.get('/groups/cancreate', this.handleCanCreate)
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.statusCode == 200) {
      this.setState({status: res.statusCode, group: data, error: null})
    } else {
      this.setState({status: res.statusCode, error: res.body, group: null})
    }
  }

  _save() {
    let {socket} = this.context
    if (this._validateAll()) {
      socket.post('/groups', {
        name: this.state.group.name,
        _csrf: _csrf
      }, this.handleSaveResponse)
    }
  }

  _update() {
    let {socket} = this.context
    if (this._validateAll()) {
      socket.put('/groups/' + this.props.match.params.groupId, {
        name: this.state.group.name,
        _csrf: _csrf
      }, this.handleSaveResponse)
    }
  }

  _remove() {
    let {socket} = this.context
    if (!this.state.deleted) {
      socket.delete('/groups/' + this.props.match.params.groupId, {
        _csrf: _csrf
      }, this.handleDestroyResponse)
    }
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

  handleSaveResponse(data) {
    const {formatMessage} = this.props.intl
    if (data.code == 'E_VALIDATION') {
      this.setState({
        error: data.details,
        bsStyle: {
          name: 'error'
        }
      })
    } else if (data.id != undefined) {
      notify.show(formatMessage(messages.saved), 'success')
      this.setState({error: null})
      let id = data.id
      this.context.history.push('/group/' + id)
    }
  }

  _validateAll() {
    let passed = true
    if (this.state.group.name.length == 0) {
      this.setState({
        bsStyle: {
          name: 'error'
        }
      })
      passed = false
    } else {
      this.setState({
        bsStyle: {
          name: 'success'
        }
      })
    }

    return passed
  }

  _handleNameChange(event) {
    this.setState({
      group: {
        name: event.target.value
      }
    })
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

    let fieldName =
    <FormGroup controlId="name" className="col-xs-12" validationState={this.state.bsStyle.name}>
      <ControlLabel className="col-xs-12 col-sm-2">{formatMessage(messages.groupFieldNameLabel)}</ControlLabel>
      <Col xs={12} sm={5}>
        <FormControl type="text" value={this.state.group.name} onChange={this._handleNameChange} ref="name" placeholder={formatMessage(messages.groupFieldNamePlaceholder)}/>
        <FormControl.Feedback/>
      </Col>
    </FormGroup>

    let create = null
    let update = null
    let remove = null
    let title = null

    if (this.state.edit) {
      update = this._update
      remove = this._remove
      title = <FormattedMessage {...messages.groupEditTitle}/>
    } else {
      create = this._save
      title = <FormattedMessage {...messages.groupTitle}/>
    }

    return (
      <Row>
        <PageHeader>{title}</PageHeader>
        <Col xs={12}>
          {errorMessage}
          <form className="form-horizontal">
            {fieldName}
          </form>
          <EditToolbar create={create} update={update} remove={remove}/>
        </Col>
      </Row>
    )
  }
}

GroupEdit.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

GroupEdit.propTypes = {
  groupId: PropTypes.number
}

export default injectIntl(GroupEdit)
