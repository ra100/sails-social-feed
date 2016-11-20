import {Component, PropTypes} from 'react'

class MessageAuthor extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this))
  }

  constructor(props, context) {
    super(props, context)
  }

  render() {
    let {author} = this.props
    let {type} = this.props
    let a = <span>No Author</span>

    switch (type) {
      case 'twitter':
        a = <span className="author">
          <a href={author.url} target="_blank">
            <img height="48" width="48" src={author.picture} className="user-picture"/>
          </a>
          <a className="user-name" href={author.url} target="_blank">{author.name}
          </a>
          <span className="user-handle">@{author.handle}</span>
        </span>
        break
      case 'facebook':
        a = <span className="author">
          <a href={author.url} target="_blank">
            <img height="48" width="48" src={author.picture} className="user-picture"/>
          </a>
          <a className="user-name" href={author.url} target="_blank">{author.name}
          </a>
        </span>
        break
      case 'admin':
        a = <span className="author">
          <img height="48" width="48" src={author.picture} className="user-picture"/>
          <a className="user-name" href={'#/user/' + author.id}>
            {author.name}
          </a>
        </span>
        break
    }

    return a
  }
}

MessageAuthor.propTypes = {
  author: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired
}

export default MessageAuthor