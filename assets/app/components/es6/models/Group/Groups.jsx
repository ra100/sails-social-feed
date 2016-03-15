import {Component, PropTypes} from 'react';
import {Col, Row, Grid, PageHeader, Table} from 'react-bootstrap';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import Forbidden from './../../Forbidden';
import NotFound from './../../NotFound';
import GroupRow from './GroupRow';
import _ from 'lodash';

const messages = defineMessages({
  permissionDenied: {
    id: 'error.forbidden.title',
    description: 'Page title for pernission denied',
    defaultMessage: 'Permission denied'
  },
  groupsTitle: {
    id: 'groups.all.title',
    description: 'Page title for groups overview',
    defaultMessage: 'Groups'
  }
});

class Groups extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      groups: null,
      status: 0,
      error: null,
      page: 0,
      perPage: 30
    };
    this._bind('handleResponse');
  }

  componentDidMount() {
    this._isMounted = true;
    let {socket} = this.context;
    let url = '/groups?skip=' + this.state.page * this.state.perPage;
    socket.get(url, this.handleResponse);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleResponse(data, res) {
    if (!this._isMounted) {
      return;
    }
    if (res.error) {
      this.setState({status: res.statusCode, error: res.body, groups: null});
    } else {
      this.setState({status: res.statusCode, groups: data, error: null});
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
        if (this.state.groups !== null) {
          return (
            <Row>
              <PageHeader>
                <FormattedMessage {...messages.groupsTitle}/>
              </PageHeader>
              <Col xs={12}>
                <Table striped bordered condensed hover>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.groups.map(function (group, i) {
                      return <GroupRow group={group} key={i}/>;
                    })}
                  </tbody>
                </Table>
              </Col>
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

Groups.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

export default injectIntl(Groups);