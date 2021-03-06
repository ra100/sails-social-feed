import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Col,
  Row,
  Button,
  PageHeader,
  Alert,
  Label,
  Table,
  Pagination
} from 'react-bootstrap'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Forbidden from './../../Forbidden'
import NotFound from './../../NotFound'
import Error from './../../Error'
import Loading from './../../Loading'
import EditToolbar from './../../EditToolbar'
import FeedRow from './../Feed/FeedRow'
import MessageNewModal from './../Message/MessageNewModal'
import MessageRow from './../Message/MessageRow'
import array from 'lodash/array'

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
  },
  streamFieldFeedsLabel: {
    id: 'stream.field.feeds.label',
    description: 'Feeds label',
    defaultMessage: 'Feeds'
  },
  streamFieldMessagesLabel: {
    id: 'stream.field.messages.label',
    description: 'Messages label',
    defaultMessage: 'Messages'
  },
  streamFieldDisplayLabel: {
    id: 'stream.field.display.label',
    description: 'Stream Display label',
    defaultMessage: 'Show unreviewed'
  },
  streamFieldPublishedLabel: {
    id: 'stream.field.published.label',
    description: 'Stream Published label',
    defaultMessage: 'Published'
  },
  feedFieldNameLabel: {
    id: 'feed.field.name.label',
    description: 'Feed Name label',
    defaultMessage: 'Name'
  },
  feedFieldDisplayLabel: {
    id: 'feed.field.display.label',
    description: 'Feed Display label',
    defaultMessage: 'Default publish'
  },
  feedFieldConfigLabel: {
    id: 'feed.field.config.label',
    description: 'Feed Config label',
    defaultMessage: 'Source ID'
  },
  feedFieldTypeLabel: {
    id: 'feed.field.type.label',
    description: 'Feed Type label',
    defaultMessage: 'Type'
  },
  feedFieldStreamLabel: {
    id: 'feed.field.stream.label',
    description: 'Feed Stream label',
    defaultMessage: 'Stream'
  },
  feedFieldGroupsLabel: {
    id: 'feed.field.groups.label',
    description: 'Groups label',
    defaultMessage: 'Groups'
  },
  action: {
    id: 'streams.action',
    description: 'Table header action',
    defaultMessage: 'Action'
  },
  addButton: {
    id: 'message.add.button',
    description: 'Add new message button',
    defaultMessage: 'New Message'
  },
  messageFieldPublishedLabel: {
    id: 'message.field.published.label',
    description: 'Published label',
    defaultMessage: 'Published'
  },
  messageFieldReviewedLabel: {
    id: 'message.field.reviewed.label',
    description: 'Reviewed label',
    defaultMessage: 'Reviewed'
  },
  messageFieldCreatedLabel: {
    id: 'message.field.created.label',
    description: 'Created label',
    defaultMessage: 'Date'
  },
  messageFieldMessageLabel: {
    id: 'message.field.message.label',
    description: 'Message label',
    defaultMessage: 'Message'
  },
  messageFieldTypeLabel: {
    id: 'message.field.type.label',
    description: 'Message feed type label',
    defaultMessage: 'Type'
  },
  messageFieldAuthorLabel: {
    id: 'message.field.author.label',
    description: 'Message feed author label',
    defaultMessage: 'Author'
  }
})

class StreamView extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      stream: null,
      messages: [],
      status: 0,
      error: null,
      newMessageShow: false,
      reply_id: '',
      page: 0,
      items_per_page: 20,
      messages_count: 0,
      streamId: 0
    }
    this._bind(
      '_edit',
      'handleLoad',
      'load',
      'renderFeeds',
      'addMessage',
      'handleMessagesLoad',
      'processSocketStream',
      'processMessage',
      'hideMessageModal',
      '_handlePagination',
      'handleCountLoad',
      'openReply'
    )
  }

  componentDidMount() {
    this._isMounted = true
    this.setState(
      {
        streamId: this.props.match.params.streamId
      },
      this.load
    )
  }

  load(nextProps) {
    if (!this._isMounted) {
      return
    }
    let { socket } = this.context
    let query = {
      populate: 'feeds,groups,owner'
    }
    socket.get('/streams/' + this.state.streamId, query, this.handleLoad)
    socket.get(
      '/streams/messagecount/' + this.state.streamId,
      this.handleCountLoad
    )
    this.loadMessages()
    socket.on('stream', this.processSocketStream)
  }

  loadMessages() {
    if (!this._isMounted) {
      return
    }
    let { socket } = this.context
    let messages_query = {
      sort: 'created DESC',
      limit: this.state.items_per_page,
      skip: this.state.page * this.state.items_per_page,
      populate: ['relatedMessage', 'parentMessage'],
      all: true
    }
    socket.get(
      '/streams/messages/' + this.state.streamId,
      messages_query,
      this.handleMessagesLoad
    )
  }

  componentWillUnmount() {
    this._isMounted = false
    this.context.socket.off('stream', this.processSocketStream)
    this.context.socket.get('/streams/unsubscribe')
    this.context.socket.get('/feeds/unsubscribe')
    this.context.socket.get('/messages/unsubscribe')
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.streamId !== this.props.match.params.streamId) {
      this.setState(
        {
          stream: null,
          status: 0,
          error: null,
          streamId: nextProps.match.params.streamId
        },
        this.load
      )
    }
  }

  handleLoad(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.error) {
      this.setState({ status: res.statusCode, error: res.body, stream: null })
    } else {
      this.setState({ status: res.statusCode, error: null, stream: data })
    }
  }

  handleCountLoad(data, res) {
    if (!this._isMounted) {
      return
    }
    this.setState({ messages_count: (data && data.count) || 0 })
  }

  handleMessagesLoad(data, res) {
    if (!this._isMounted) {
      return
    }
    if (res.error) {
      this.setState({ status: res.statusCode, error: res.body, messages: null })
    } else {
      this.setState({ status: res.statusCode, error: null, messages: data })
    }
  }

  _edit() {
    this.context.history.push('/stream/' + this.state.stream.id + '/edit')
  }

  _handlePagination(page, event) {
    this.setState(
      {
        page: page - 1
      },
      this.loadMessages
    )
  }

  hideMessageModal() {
    this.setState({ newMessageShow: false })
  }

  addMessage(event) {
    let rpl = this.state.reply_id
    this.setState({ newMessageShow: true, reply_id: rpl })
  }

  openReply(parentId) {
    this.setState({ newMessageShow: true, reply_id: parentId })
  }

  processSocketStream(event) {
    if (event.id != this.state.streamId) {
      return
    }
    switch (event.verb) {
      case 'addedTo':
        if (event.added) {
          this.processMessage(event.added)
        } else {
          this.context.socket.get(
            '/messages/' + event.addedId,
            {
              populate: ''
            },
            this.processMessage
          )
        }
        break
      case 'messaged':
        if (
          event.data.action !== undefined &&
          event.data.action == 'destroyed'
        ) {
          let ms = this.state.messages.filter(function(r) {
            return r.id !== event.data.id
          })
          this.setState({ messages: ms })
        }
        break
      case 'removedFrom':
      default:
        console.debug(event)
        break
    }
  }

  processMessage(data, res) {
    let m = data
    let ms = this.state.messages
    if (ms.length === 0) {
      ms.push(m)
      this.setState({ messages: ms })
      return
    }
    let i = array.findIndex(ms, function(o) {
      return o.id == m.id
    })
    if (i >= 0) {
      ms[i] = m
    } else {
      if (array.head(ms).created < m.created) {
        let tmp = array.reverse(ms)
        tmp.push(m)
        ms = array.take(array.reverse(tmp), 20)
      }
    }
    this.setState({ messages: ms })
  }

  renderFeeds() {
    if (this.state.stream.feeds.length == 0) {
      return null
    }
    return (
      <Col xs={12}>
        <Table striped hover condensed responsive>
          <thead>
            <tr>
              <th>
                <FormattedMessage {...messages.feedFieldNameLabel} />
              </th>
              <th>
                <FormattedMessage {...messages.feedFieldDisplayLabel} />
              </th>
              <th>
                <FormattedMessage {...messages.feedFieldTypeLabel} />
              </th>
              <th>
                <FormattedMessage {...messages.feedFieldConfigLabel} />
              </th>
              <th>
                <FormattedMessage {...messages.action} />
              </th>
            </tr>
          </thead>
          <tbody>
            {this.state.stream.feeds.map(function(feed, i) {
              return <FeedRow feed={feed} key={i} />
            })}
          </tbody>
        </Table>
      </Col>
    )
  }

  render() {
    const { formatMessage } = this.props.intl

    switch (this.state.status) {
      case 403:
        return <Forbidden />
        break

      case 404:
        return <NotFound />
        break

      case 200:
        if (this.state.stream !== null) {
          let { stream } = this.state
          let feeds = this.renderFeeds()
          let pub = <i className="material-icons">check_box_outline_blank</i>
          if (stream.published) {
            pub = <i className="material-icons">check_box</i>
          }
          let display = (
            <i className="material-icons">check_box_outline_blank</i>
          )
          if (stream.display) {
            display = <i className="material-icons">check_box</i>
          }
          let newMessageButton = (
            <Button bsStyle="primary" onClick={this.addMessage} value={123}>
              <i className="material-icons">add_circle</i>
              <FormattedMessage {...messages.addButton} />
            </Button>
          )
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
              {this.state.page + 1 <= Math.ceil(
                this.state.messages_count / this.state.items_per_page
              ) && (
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
                    Math.ceil(
                      this.state.messages_count / this.state.items_per_page
                    )
                  )
                }
              />
            </Pagination>
          )
          const openReply = this.openReply

          let msgs = null

          if (this.state.messages.length > 0) {
            msgs = this.state.messages.map(function(message, i) {
              return (
                <MessageRow
                  message={message}
                  key={message.id}
                  replyCallback={openReply}
                />
              )
            })
          }

          return (
            <Row>
              <PageHeader>{stream.name}</PageHeader>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldUniqueNameLabel} />
              </Col>
              <Col xs={9}>
                <strong>{stream.uniqueName}</strong>
              </Col>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldRefreshLabel} />
              </Col>
              <Col xs={9}>
                <strong>{stream.refresh}</strong>
                s
              </Col>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldStateLabel} />
              </Col>
              <Col xs={9}>
                <strong>{stream.state}</strong>
              </Col>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldDisplayLabel} />
              </Col>
              <Col xs={9}>{display}</Col>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldPublishedLabel} />
              </Col>
              <Col xs={9}>{pub}</Col>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldOwnerLabel} />
              </Col>
              <Col xs={9}>
                <strong>{stream.owner && stream.owner.username}</strong>
              </Col>

              <Col xs={3}>
                <FormattedMessage {...messages.streamFieldGroupsLabel} />
              </Col>
              <Col xs={9}>
                {stream.groups.map(function(group, i) {
                  return <Label key={i}>{group.name}</Label>
                })}
              </Col>

              <EditToolbar edit={this._edit} />
              <Col xs={12}>
                <h3>
                  <FormattedMessage {...messages.streamFieldFeedsLabel} />
                </h3>
              </Col>
              {feeds}
              <Col xs={12}>
                <h3>
                  <FormattedMessage {...messages.streamFieldMessagesLabel} />
                </h3>
                {newMessageButton}
                <MessageNewModal
                  ref="newModal"
                  streamId={this.props.match.params.streamId}
                  show={this.state.newMessageShow}
                  onHide={this.hideMessageModal}
                  parentId={this.state.reply_id}
                />
              </Col>
              <Col xs={12}>
                {pager}
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>
                        <FormattedMessage
                          {...messages.messageFieldPublishedLabel}
                        />
                      </th>
                      <th>
                        <FormattedMessage
                          {...messages.messageFieldReviewedLabel}
                        />
                      </th>
                      <th>
                        <FormattedMessage
                          {...messages.messageFieldCreatedLabel}
                        />
                      </th>
                      <th>
                        <FormattedMessage
                          {...messages.messageFieldAuthorLabel}
                        />
                      </th>
                      <th>
                        <FormattedMessage
                          {...messages.messageFieldMessageLabel}
                        />
                      </th>
                      <th>
                        <FormattedMessage {...messages.messageFieldTypeLabel} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>{msgs}</tbody>
                </Table>
                {pager}
              </Col>
            </Row>
          )
        } else {
          return null
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

StreamView.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

export default injectIntl(StreamView)
