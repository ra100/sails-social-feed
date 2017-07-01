import {Component} from 'react'
import PropTypes from 'prop-types'
import {
  td,
  Row,
  Button,
  PageHeader,
  Alert,
  Label
} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl'
import Forbidden from './../../Forbidden'
import NotFound from './../../NotFound'
import Error from './../../Error'
import Loading from './../../Loading'
import EditToolbar from './../../EditToolbar'
import _ from 'lodash/core'

const messages = defineMessages({
  streamFieldUniqueNameLabel: {
    id: 'stream.field.uniquename.label',
    description: 'Stream UniqueName label',
    defaultMessage: 'Unique name'
  },
  streamFieldStateLabel: {
    id: 'stream.field.state.label',
    description: 'Stream State label',
    defaultMessage: 'State'
  },
  streamFieldRefreshLabel: {
    id: 'stream.field.refresh.label',
    description: 'Stream refresh label',
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
  }
})

class StreamRow extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this))
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
    const {formatMessage} = this.props.intl
    let {stream} = this.props

    let link = <LinkContainer to={'/stream/' + stream.id}>
      <Button bsStyle="link">{stream.name}</Button>
    </LinkContainer>
    if (!stream.permissions.u) {
      link = <strong>{stream.name}</strong>
    }

    return (
      <tr key={stream.id}>

        <td>
          {link}
        </td>

        <td>
          <strong>{stream.uniqueName}</strong>
        </td>

        <td>
          <strong>{stream.refresh}</strong>
          s
        </td>

        <td>
          <strong>{stream.state}</strong>
        </td>

        <td>
          <strong>{stream.owner && stream.owner.username}</strong>
        </td>

        <td>
          {stream.groups.map(function (group, i) {
            return <Label key={i}>{group.name}</Label>
          })}
        </td>
        <td>
          <EditToolbar edit={stream.permissions.u
            ? this._edit
            : null} cancel={false}/>
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