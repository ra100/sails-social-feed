import {Component} from 'react'
import PropTypes from 'prop-types'
import {Panel, ProgressBar} from 'react-bootstrap'
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl'

const messages = defineMessages({
  loading: {
    id: 'message.loading.title',
    description: 'loading',
    defaultMessage: 'Loading'
  }
})

class Loading extends Component {

  constructor(props, context) {
    super(props, context)
  }

  render() {
    const {formatMessage} = this.props.intl
    return (
      <Panel header={formatMessage(messages.loading)}>
        <ProgressBar active now={100} striped/>
      </Panel>
    )
  }
}

export default injectIntl(Loading)