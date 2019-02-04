import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Col, Row, PageHeader } from 'react-bootstrap'
import { defineMessages, injectIntl } from 'react-intl'
import Forbidden from './../../Forbidden'
import NotFound from './../../NotFound'
import Error from './../../Error'
import Loading from './../../Loading'
import EditToolbar from './../../EditToolbar'

const messages = defineMessages({})

class GroupView extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      group: null,
      status: 0,
      error: null
    }
    this._bind(
      '_remove',
      '_edit',
      'handleDestroyResponse',
      'handleLoad',
      'load'
    )
  }

  componentDidMount() {
    this._isMounted = true
    this.load()
  }

  load(nextProps) {
    if (!this._isMounted) {
      return
    }
    let { socket } = this.context
    let groupId = this.props.match.params.groupId
    if (nextProps) {
      groupId = nextProps.match.params.groupId
    }
    socket.get('/groups/' + groupId, this.handleLoad)
  }

  componentWillUnmount() {
    this._isMounted = false
    this.context.socket.get('/groups/unsubscribe')
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.groupId !== this.props.match.params.groupId) {
      this.setState({ group: null, status: 0, error: null })
      this.load(nextProps)
    }
  }

  _remove() {
    let { socket } = this.context
    if (!this.state.deleted) {
      socket.post(
        '/groups/destroy/' + this.props.match.params.groupId,
        {
          _csrf: window._csrf
        },
        this.handleDestroyResponse
      )
    }
  }

  _edit() {
    this.context.history.push('/group/' + this.state.group.id + '/edit')
  }

  handleDestroyResponse(data, res) {
    const { formatMessage } = this.props.intl
    if (!this._isMounted) {
      return
    }
    if (res.statusCode == 200) {
      this.setState({ deleted: true })
      window.notify.show(formatMessage(messages.deletedSuccess), 'success')
      this.context.history.goBack()
    } else {
      window.notify.show(res.body, 'error')
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.error) {
      this.setState({ status: res.statusCode, error: res.body, group: null })
    } else {
      this.setState({ status: res.statusCode, group: data, error: null })
    }
  }

  render() {
    switch (this.state.status) {
      case 403:
        return <Forbidden />

      case 404:
        return <NotFound />

      case 200:
        if (this.state.group !== null) {
          let { group } = this.state
          return (
            <Row>
              <PageHeader>{group.name}</PageHeader>
              <Col xs={12} />
              <EditToolbar edit={this._edit} remove={this._remove} />
            </Row>
          )
        }
        break

      case 0:
        return <Loading />

      default:
        return <Error error={this.state.error} />
    }
  }
}

GroupView.propTypes = {
  match: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

GroupView.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

export default injectIntl(GroupView)
