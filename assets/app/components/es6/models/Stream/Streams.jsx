import {Component, PropTypes} from 'react';
import {Col, Row, Grid, PageHeader, Table} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import Loading from './../../Loading';
import StreamRow from './StreamRow';
import _ from 'lodash/core';

const messages = defineMessages({
  streamsTitle: {
    id: 'streams.all.title',
    description: 'Page title for streams overview',
    defaultMessage: 'Streams'
  },
  streamFieldNameLabel: {
    id: 'stream.field.name.label',
    description: 'Stream Name label',
    defaultMessage: 'Name'
  },
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
  },
  action: {
    id: 'streams.action',
    description: 'Table header action',
    defaultMessage: 'Action'
  }
});

class Streams extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      streams: null,
      status: 0,
      error: null,
      page: 0,
      perPage: 30
    };
    this._bind('_loadData', 'handleResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadData();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.socket.get('/streams/unsubscribe');
  }

  handleResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.error) {
      this.setState({status: res.statusCode, error: res.body, streams: null});
    } else {
      this.setState({status: res.statusCode, streams: data, error: null});
    }
  }

  _loadData() {
    if (!this._isMounted) {
      return;
    }
    let {socket} = this.context;
    let query = {
      skip: this.state.page * this.state.perPage,
      populate: 'groups,owner'
    };
    socket.get('/streams', query, this.handleResponse);
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
        if (this.state.streams !== null) {
          return (
            <Row>
              <PageHeader>
                <FormattedMessage {...messages.streamsTitle}/>
              </PageHeader>
              <Col xs={12}>
                <Table striped hover condensed responsive>
                  <thead>
                    <tr>
                      <th><FormattedMessage {...messages.streamFieldNameLabel}/></th>
                      <th><FormattedMessage {...messages.streamFieldUniqueNameLabel}/></th>
                      <th><FormattedMessage {...messages.streamFieldRefreshLabel}/></th>
                      <th><FormattedMessage {...messages.streamFieldStateLabel}/></th>
                      <th><FormattedMessage {...messages.streamFieldOwnerLabel}/></th>
                      <th><FormattedMessage {...messages.streamFieldGroupsLabel}/></th>
                      <th><FormattedMessage {...messages.action}/></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.streams.map(function (stream, i) {
                      if (stream.permissions.r) {
                        return <StreamRow stream={stream} key={i}/>;
                      } else {
                        return null;
                      }
                    })}
                  </tbody>
                </Table>
              </Col>
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

Streams.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(Streams);