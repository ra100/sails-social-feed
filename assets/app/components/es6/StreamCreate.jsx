import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';

const messages = defineMessages({
  streamTitle: {
    id: 'stream.new.title',
    description: 'Title of Create stream page',
    defaultMessage: 'Create New Stream'
  }
});

class StreamCreate extends Component {

  _bind (...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor (props, context) {
    super(props, context);
  }

  render () {
    const {formatMessage} = this.props.intl;

    return (
      <Row>
        <PageHeader>
          <FormattedMessage {...messages.streamTitle}/>
        </PageHeader>
        <Col xs={12}>
          <form>
            <Input type="text" label="Name" placeholder="Stream Name"></Input>
          </form>
          <Button>Ola</Button>
        </Col>
      </Row>
    );
  }
}

StreamCreate.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export default injectIntl(StreamCreate);