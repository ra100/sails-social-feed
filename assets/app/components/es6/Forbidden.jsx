import {Component} from 'react';
import {Alert} from 'react-bootstrap';
import {FormattedMessage, defineMessages,} from 'react-intl';

const messages = defineMessages({
  forbidden: {
    id: 'message.forbidden.message',
    description: 'Forbidden message',
    defaultMessage: 'You are not allowed to view this content.'
  },
  forbiddenTitle: {
    id: 'message.forbidden.title',
    description: 'Forbidden title',
    defaultMessage: 'Insufficient permissions'
  },
});

class Forbidden extends Component {
  render() {
    return (
      <Alert bsStyle="danger">
        <h4><FormattedMessage {...messages.forbiddenTitle}/></h4>
        <p><FormattedMessage {...messages.forbidden}/></p>
      </Alert>
    );
  }
}

export default Forbidden;