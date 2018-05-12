import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Col,
  Row,
  Grid,
  PageHeader,
  Table,
  Pagination,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Forbidden from './../../Forbidden'
import NotFound from './../../NotFound'
import Loading from './../../Loading'
import UserRow from './UserRow'
import _ from 'lodash/core'

const messages = defineMessages({
  usersTitle: {
    id: 'user.all.title',
    description: 'Page title for users overview',
    defaultMessage: 'Users'
  },
  name: {
    id: 'user.field.name.label',
    description: 'Table header name',
    defaultMessage: 'User'
  },
  email: {
    id: 'user.field.email.label',
    description: 'Table header email',
    defaultMessage: 'Email'
  },
  roles: {
    id: 'user.field.roles.label',
    description: 'Table header role',
    defaultMessage: 'Roles'
  },
  groups: {
    id: 'user.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
  action: {
    id: 'user.action',
    description: 'Table header action',
    defaultMessage: 'Action'
  },
  filter: {
    id: 'user.filter',
    description: 'label for fulltext filter of users',
    defaultMessage: 'Filter'
  }
})

class Users extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      users: null,
      status: 0,
      error: null,
      page: 0,
      per_page: 30,
      count: 0,
      filter: ''
    }
    this._bind(
      '_loadData',
      'handleResponse',
      'handleCountResponse',
      '_filterData',
      '_handleFilterChange',
      '_handlePagination'
    )
  }

  componentDidMount() {
    this._isMounted = true
    this._loadData()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.context.socket.get('/users/unsubscribe')
    this.context.socket.get('/groups/unsubscribe')
    this.context.socket.get('/roles/unsubscribe')
  }

  handleResponse(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.error) {
      this.setState({ status: res.statusCode, error: res.body, users: null })
    } else {
      this.setState({ status: res.statusCode, error: null, users: data })
    }
  }

  handleCountResponse(data, res) {
    if (!this._isMounted) {
      return
    }
    if (!res.error) {
      this.setState({ count: res.body.count })
    }
  }

  _loadData() {
    if (!this._isMounted) {
      return
    }
    const { socket } = this.context
    const query = {
      skip: this.state.page * this.state.per_page,
      populate: 'roles,groups'
    }
    socket.get('/users', query, this.handleResponse)
    socket.get('/users/count', this.handleCountResponse)
  }

  _handlePagination(page) {
    this.setState({ page })
    const { socket } = this.context
    const query = { skip: page * this.state.per_page, populate: 'roles,groups' }
    socket.get('/users', query, this.handleResponse)
  }

  _handleFilterChange(event) {
    this.setState({ filter: event.target.value })
    this._filterData(event.target.value)
  }

  _filterData(filter) {
    if (!this._isMounted) {
      return
    }
    const filterValue = filter || event.target.value
    if (!filterValue) {
      return this._loadData()
    }
    const query = {
      populate: 'roles,groups',
      fulltext: filterValue
    }
    const { socket } = this.context
    socket.get('/users', query, this.handleResponse)
  }

  render() {
    const { formatMessage } = this.props.intl

    const pager = (
      <Pagination>
        <Pagination.First onClick={() => this._handlePagination(1)} />
        <Pagination.Prev
          onClick={() => this._handlePagination(this.state.page)}
        />
        {this.state.page > 0 && (
          <Pagination.Item
            onClick={() => this._handlePagination(this.state.page)}
          >
            {this.state.page}
          </Pagination.Item>
        )}
        <Pagination.Item active>{this.state.page + 1}</Pagination.Item>
        {this.state.page + 1 <=
          Math.ceil(this.state.count / this.state.per_page) && (
          <Pagination.Item
            onClick={() => this._handlePagination(this.state.page + 2)}
          >
            {this.state.page + 2}
          </Pagination.Item>
        )}
        <Pagination.Next
          onClick={() => this._handlePagination(this.state.page + 2)}
        />
        <Pagination.Last
          onClick={() =>
            this._handlePagination(
              Math.ceil(this.state.count / this.state.per_page)
            )
          }
        />
      </Pagination>
    )
    const filter = (
      <FormGroup controlId="filter" className="col-xs-12">
        <ControlLabel className="col-xs-12 col-sm-2">
          {formatMessage(messages.filter)}
        </ControlLabel>
        <Col xs={12} sm={5}>
          <FormControl
            type="text"
            value={this.state.filter}
            onChange={this._handleFilterChange}
            ref="filter"
          />
          <FormControl.Feedback />
        </Col>
      </FormGroup>
    )

    switch (this.state.status) {
      case 403:
        return <Forbidden />
        break

      case 404:
        return <NotFound />
        break

      case 200:
        if (this.state.users !== null) {
          return (
            <Row>
              <PageHeader>
                <FormattedMessage {...messages.usersTitle} />
              </PageHeader>
              <Col xs={12}>
                {filter}
                {pager}
                <Table striped hover condensed responsive>
                  <thead>
                    <tr>
                      <th>
                        <FormattedMessage {...messages.name} />
                      </th>
                      <th>
                        <FormattedMessage {...messages.email} />
                      </th>
                      <th>
                        <FormattedMessage {...messages.roles} />
                      </th>
                      <th>
                        <FormattedMessage {...messages.groups} />
                      </th>
                      <th>
                        <FormattedMessage {...messages.action} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.users.map(function(user, i) {
                      return <UserRow user={user} key={i} />
                    })}
                  </tbody>
                </Table>
                {pager}
              </Col>
            </Row>
          )
        }
        break

      case 0:
        return <Loading />
        break

      default:
        return <Error error={this.state.error} />
    }
  }
}

Users.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

export default injectIntl(Users)
