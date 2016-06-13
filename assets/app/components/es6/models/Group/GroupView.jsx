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
import Loading from './../../Loading';
import EditToolbar from './../../EditToolbar';
import _ from 'lodash/core';

const messages = defineMessages({});

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
    this._bind('_remove', '_edit', 'handleDestroyResponse', 'handleLoad', 'load');
  }

  componentDidMount() {
    this._isMounted = true;
    this.load();
  }

  load(nextProps) {
    if (!this._isMounted) {
      return;
    }
    let {socket} = this.context;
    let groupId = this.props.params.groupId;
    if (nextProps) {
      groupId = nextProps.params.groupId;
    }
    socket.get('/groups/' + groupId, this.handleLoad);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.socket.get('/groups/unsubscribe');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.groupId !== this.props.params.groupId) {
      this.setState({group: null, status: 0, error: null});
      this.load(nextProps);
    }
  }

  _remove() {
    let {socket} = this.context;
    if (!this.state.deleted) {
      socket.post('/groups/destroy/' + this.props.group.id, {
        _csrf: _csrf
      }, this.handleDestroyResponse);
    }
  }

  _edit() {
    this.context.history.push('/group/' + this.state.group.id + '/edit');
  }

  handleDestroyResponse(data, res) {
    const {formatMessage} = this.props.intl;
    if (!this._isMounted) {
      return;
    }
    if (res.statusCode == 200) {
      this.setState({deleted: true});
      notify.show(formatMessage(messages.deletedSuccess), 'success');
      this.props.history.goBack();
    } else {
      notify.show(res.body, 'error');
    }
  }

  handleLoad(data, res) {
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
        return (<Forbidden/>);
        break;

      case 404:
        return (<NotFound/>);
        break;

      case 200:
        if (this.state.group !== null) {
          let {group} = this.state;
          return (
            <Row>
              <PageHeader>
                {group.name}
              </PageHeader>
              <Col xs={12}></Col>
              <EditToolbar edit={this._edit} remove={this._remove}/>
            </Row>
          );
        }
        break;

      case 0:
        return (<Loading/>);
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