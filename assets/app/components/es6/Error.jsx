import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Alert, Row, PageHeader } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'

const messages = defineMessages({
  errorTitle: {
    id: 'message.error.title',
    description: 'Unexpected error title',
    defaultMessage: 'Error'
  }
})

class Error extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      error: props.error
    }
  }

  render() {
    return (
      <Row>
        <PageHeader>
          <FormattedMessage {...messages.errorTitle} />
        </PageHeader>
        <Alert bsStyle="danger">
          <p>{this.state.error}</p>
        </Alert>
      </Row>
    )
  }
}

Error.propTypes = {
  error: PropTypes.object.isRequired
}

export default Error
