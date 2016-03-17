import {Component, PropTypes} from 'react';
import {Alert, PageHeader, Row} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';

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
  permissionDenied: {
    id: 'error.forbidden.title',
    description: 'Page title for permission denied',
    defaultMessage: 'Permission denied'
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
    const {formatMessage} = this.props.intl;
    return (
      <Row>
        <PageHeader>
          {this.state.title ? this.state.title: formatMessage(messages.permissionDenied)}
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
  title: PropTypes.string
};

export default injectIntl(Forbidden);