import {Component, PropTypes} from 'react';
import {Alert, PageHeader, Row} from 'react-bootstrap';
import {FormattedMessage, defineMessages} from 'react-intl';

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
  }
});

class Forbidden extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      title: props.title
    };
  }

  render() {
    return (
      <Row>
        <PageHeader>
          {this.state.title}
        </PageHeader>
        <Alert bsStyle="danger">
          <h4><FormattedMessage {...messages.forbiddenTitle}/></h4>
          <p><FormattedMessage {...messages.forbidden}/></p>
        </Alert>
      </Row>
    );
  }
}

Forbidden.propTypes = {
  title: PropTypes.string.isRequired
};

export default Forbidden;