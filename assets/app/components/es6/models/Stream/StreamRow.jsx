import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { td, Button, Label } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { injectIntl } from 'react-intl'
import EditToolbar from './../../EditToolbar'

class StreamRow extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this._bind('_edit')
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  _edit() {
    this.context.history.push('/stream/' + this.props.stream.id + '/edit')
  }

  render() {
    let { stream } = this.props

    let link = (
      <LinkContainer to={'/stream/' + stream.id}>
        <Button bsStyle="link">{stream.name}</Button>
      </LinkContainer>
    )
    if (!stream.permissions.u) {
      link = <strong>{stream.name}</strong>
    }

    return (
      <tr key={stream.id}>
        <td>{link}</td>

        <td>
          <strong>{stream.uniqueName}</strong>
        </td>

        <td>
          <strong>{stream.refresh}</strong>s
        </td>

        <td>
          <strong>{stream.state}</strong>
        </td>

        <td>
          <strong>{stream.owner && stream.owner.username}</strong>
        </td>

        <td>
          {stream.groups.map(function(group, i) {
            return <Label key={i}>{group.name}</Label>
          })}
        </td>
        <td>
          <EditToolbar
            edit={stream.permissions.u ? this._edit : null}
            cancel={false}
          />
        </td>
      </tr>
    )
  }
}

StreamRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

StreamRow.propTypes = {
  stream: PropTypes.object.isRequired
}

export default injectIntl(StreamRow)
