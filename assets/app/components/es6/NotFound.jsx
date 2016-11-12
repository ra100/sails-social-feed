import {Component} from 'react'
import {Alert, Row, PageHeader} from 'react-bootstrap'
import {FormattedMessage, defineMessages,} from 'react-intl'

const messages = defineMessages({
  itemNotFoundTitle: {
    id: 'error.item.notfound.title',
    description: 'Page not found title',
    defaultMessage: 'Item not found',
  },
  itemNotFoundMessage: {
    id: 'error.item.notfound.message',
    description: 'Page not found message',
    defaultMessage: 'We are sorry, requested item was not found.',
  },
})

class NotFound extends Component {
  render() {
    return (
      <Row>
        <PageHeader>
          <FormattedMessage {...messages.itemNotFoundTitle}/>
        </PageHeader>
        <Alert bsStyle="warning">
          <p><FormattedMessage {...messages.itemNotFoundMessage}/></p>
        </Alert>
      </Row>
    )
  }
}

export default NotFound