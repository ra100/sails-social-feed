import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Grid,
  Button,
  Input,
  PageHeader,
  ButtonToolbar,
  Alert,
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import _ from 'lodash';

const messages = defineMessages({
  permissionDenied: {
    id: 'error.forbidden.title',
    description: 'Page title for pernission denied',
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
      allow: true,
      status: 200
    };
    this._bind('_init');
    this._init();
  }

  _init() {
    let _self = this;
    let {socket} = this.context;
    socket.get('/groups/' + this.props.params.userId, function (data, res) {
      _self.setState({status: res.statusCode});
      if (data.id != undefined) {
        _self.setState({group: data, allow: true,});
      } else {
        _self.setState({group: null, allow: false,});
      }
    });
  }

  render() {
    const {formatMessage} = this.props.intl;

    if (!this.state.allow) {
      return (
        <Row>
          <PageHeader>
            <FormattedMessage {...messages.permissionDenied}/>
          </PageHeader>
          <Forbidden/>
        </Row>
      );
    }

    if (this.state.group == null) {
      return (<NotFound/>);
    }

    return (
      <Row>
        <PageHeader>
          {this.state.group.name}
        </PageHeader>
        <Col xs={12}>
        </Col>
      </Row>
    );
  }
}

GroupView.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(GroupView);