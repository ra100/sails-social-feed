import {Component} from 'react'
import PropTypes from 'prop-types'
import {FormControl} from 'react-bootstrap'
import EditToolbar from './../../EditToolbar'
import {notify} from 'react-notify-toast'
import {formatMessage, defineMessages, injectIntl} from 'react-intl'

const hashLink = 'https://twitter.com/hashtag/HASHTAG'
const userLink = 'https://twitter.com/USER'

const messages = defineMessages({
  saved: {
    id: 'message.saved.message',
    description: 'Saved notification',
    defaultMessage: 'Message has been saved'
  },
  deleted: {
    id: 'message.deleted.message',
    description: 'Deleted notification',
    defaultMessage: 'Message has been deleted'
  }
})

class MessageBody extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this))
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      message: '',
      edit: false
    }
    this._bind('renderMedia', 'renderTwitterMedia', 'renderFacebookMedia', 'renderAdminMedia', 'handleEdit', 'update', 'cancel', 'remove', '_handleMessageChange', 'handleDelete')
  }

  componentDidMount() {
    this.setState({message: this.props.message.message})
  }

  handleEdit() {
    this.setState({'edit': true})
  }

  update() {
    this.setState({edit: false})
    socket.put('/messages/' + this.props.message.id, {
      _csrf: _csrf,
      message: this.state.message
    }, this.handleUpdate)
  }

  cancel() {
    this.setState({message: this.props.message.message, edit: false})
  }

  remove() {
    socket.delete('/messages', {
      _csrf: _csrf,
      id: this.props.message.id
    }, this.handleDelete)
  }

  handleUpdate(data, res) {
    const {formatMessage} = this.props.intl
    if (res.statusCode == 500) {
      notify.show('Error 500', 'error')
      return
    }
    if (res.statusCode == 403) {
      notify.show(res.body, 'error')
      return
    }
    notify.show(formatMessage(messages.saved), 'success')
    this.setState({edit: false})
  }

  handleDelete(data, res) {
    const {formatMessage} = this.props.intl
    if (res.statusCode == 500) {
      notify.show('Error 500', 'error')
      return
    }
    if (res.statusCode == 403) {
      notify.show(res.body, 'error')
      return
    }
    notify.show(formatMessage(messages.deleted), 'success')
    this.setState({message: 'DELETED', edit: false})
  }

  _handleMessageChange(event) {
    this.setState({message: event.target.value})
  }

  renderMedia() {
    const {type} = this.props
    switch (type) {
      case 'twitter':
        return this.renderTwitterMedia()
      case 'facebook':
        return this.renderFacebookMedia()
      case 'admin':
        return this.renderAdminMedia()
      default:
        return null
    }
  }

  renderTwitterMedia() {
    const {meta} = this.props
    if (meta == null || typeof meta.media == 'undefined') {
      return null
    }
    let med = meta.media
    if (typeof meta.media_ext !== 'undefined') {
      med = meta.media_ext
    }
    let m = med.map((media, i) => {
      switch (media.type) {
        case 'photo':
          return <a key={media.id} href={media.expanded_url} target="_blank">
            <img src={media.media_url_https} width={media.sizes.small.w / 3} height={media.sizes.small.h / 3}/>
          </a>
        default:
          return null
      }
    })
    return <div className="media">
      {m}
    </div>
  }

  renderFacebookMedia() {
    const {meta, message} = this.props
    const type = message && message.mediaType
    if (type === 'video') {
      return <div dangerouslySetInnerHTML={{__html: meta.video.format && meta.video.format[1].embed_html}}></div>
    }
    let m = null
    if (type === 'album') {
      m = meta.media[0].subattachments.data.map((photo) => {
        return <a key={photo.target.id} href={photo.target.url} target="_blank">
          <img src={photo.media.image.src} width={photo.media.image.width / 4} height={photo.media.image.height / 4}/>
        </a>
      })
    }
    return <div className="media">
      {m}
    </div>
  }

  renderAdminMedia() {
    if (!this.props.message.picture) {
      return null
    }
    let {picture} = this.props.message
    return <a href={picture.original.path} target="_blank">
      <img src={picture.thumb.path} width={picture.thumb.width} height={picture.thumb.height}/>
    </a>
  }

  render() {
    let {editable} = this.props
    let {edit} = this.state
    let text = null
    let buttons = null
    if (editable) {
      if (edit) {
        text = <div>
          <FormControl componentClass="textarea" value={this.state.message} onChange={this._handleMessageChange} ref="message"/>
        </div>
        buttons = <EditToolbar update={this.update} remove={this.remove} cancelCallback={this.cancel}/>
      } else {
        text = <span className="text editable" onClick={this.handleEdit}>{this.props.message.message}</span>
      }
    } else {
      text = <span className="text">{this.props.message.message}</span>
    }
    return (
      <div>{text}{buttons}{this.renderMedia()}</div>
    )
  }
}

MessageBody.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

MessageBody.propTypes = {
  message: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object,
  editable: PropTypes.bool
}

MessageBody.defaultTypes = {
  meta: null,
  editable: false
}

export default injectIntl(MessageBody)