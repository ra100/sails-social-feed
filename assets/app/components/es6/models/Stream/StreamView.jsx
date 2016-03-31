import {Component, PropTypes} from 'react';
import {
  Col,
  Row,
  Button,
  PageHeader,
  Alert,
  Label
} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import Error from './../../Error';
import Loading from './../../Loading';
import EditToolbar from './../../EditToolbar';
import _ from 'lodash';

const messages = defineMessages({
  streamFieldUniqueNameLabel: {
    id: 'stream.field.uniquename.label',
    description: 'Stream UniqueName label',
    defaultMessage: 'Unique name'
  },
  streamFieldStateLabel: {
    id: 'stream.field.state.label',
    description: 'Stream State label',
    defaultMessage: 'State'
  },
  streamFieldRefreshLabel: {
    id: 'stream.field.refresh.label',
    description: 'Stream refresh label',
    defaultMessage: 'Refresh'
  },
  streamFieldGroupsLabel: {
    id: 'stream.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
  streamFieldOwnerLabel: {
    id: 'stream.field.owner.label',
    description: 'Owner label',
    defaultMessage: 'Owner'
  }
});

class StreamView extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      stream: null,
      status: 0,
      error: null
    };
    this._bind('_edit', 'handleLoad', 'load');
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
    let query = {
      populate: 'feeds,groups,owner'
    };
    let streamId = this.props.params.streamId;
    if (nextProps) {
      streamId = nextProps.params.streamId;
    }
    socket.get('/streams/' + streamId, query, this.handleLoad);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.streamId !== this.props.params.streamId) {
      this.setState({stream: null, status: 0, error: null});
      this.load(nextProps);
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.error) {
      this.setState({status: res.statusCode, error: res.body, stream: null});
    } else {
      this.setState({status: res.statusCode, error: null, stream: data});
    }
  }

  _edit() {
    this.props.history.push('/stream/' + this.state.stream.id + '/edit');
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
        if (this.state.stream !== null) {
          let {stream} = this.state;
          return (
            <Row>
              <PageHeader>
                {stream.name}
              </PageHeader>

              <Col xs={3}><FormattedMessage {...messages.streamFieldUniqueNameLabel}/></Col>
              <Col xs={9}>
                <strong>{stream.uniqueName}</strong>
              </Col>

              <Col xs={3}><FormattedMessage {...messages.streamFieldRefreshLabel}/></Col>
              <Col xs={9}>
                <strong>{stream.refresh}</strong> s
              </Col>

              <Col xs={3}><FormattedMessage {...messages.streamFieldStateLabel}/></Col>
              <Col xs={9}>
                <strong>{stream.state}</strong>
              </Col>

              <Col xs={3}><FormattedMessage {...messages.streamFieldOwnerLabel}/></Col>
              <Col xs={9}>
                <strong>{stream.owner.username}</strong>
              </Col>

              <Col xs={3}><FormattedMessage {...messages.streamFieldGroupsLabel}/></Col>
              <Col xs={9}>
                {stream.groups.map(function (group, i) {
                  return <Label key={i}>{group.name}</Label>;
                })}
              </Col>
              <EditToolbar edit={this._edit}/>
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

StreamView.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(StreamView);