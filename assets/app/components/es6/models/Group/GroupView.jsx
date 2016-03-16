import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader,
  ButtonToolbar,
  Alert
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import Error from './../../Error';
import _ from 'lodash';

const messages = defineMessages({
  permissionDenied: {
    id: 'error.forbidden.title',
    description: 'Page title for permission denied',
    defaultMessage: 'Permission denied'
  }
});

class GroupView extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      group: null,
      status: 0,
      error: null
    };
    this._bind('handleResponse');
  }

  componentDidMount() {
    let {socket} = this.context;
    this._isMounted = true;
    socket.get('/groups/' + this.props.params.groupId, this.handleResponse);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.error) {
      this.setState({status: res.statusCode, error: res.body, group: null});
    } else {
      this.setState({status: res.statusCode, group: data, error: null});
    }
  }

  render() {
    const {formatMessage} = this.props.intl;

    switch (this.state.status) {
      case 403:
        return (<Forbidden title={formatMessage(messages.permissionDenied)}/>);
        break;

      case 404:
        return (<NotFound/>);
        break;

      case 200:
        if (this.state.group !== null) {
          return (
            <Row>
              <PageHeader>
                {this.state.group.name}
              </PageHeader>
              <Col xs={12}></Col>
            </Row>
          );
        }
        break;

      case 0:
        return (
          <div></div>
        );
        break;

      default:
        return (<Error error={this.state.error}/>);
    }
  }
}

GroupView.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(GroupView);