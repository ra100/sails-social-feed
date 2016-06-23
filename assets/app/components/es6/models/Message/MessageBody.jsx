import {Component, PropTypes} from 'react';

const hashLink = 'https://twitter.com/hashtag/HASHTAG';
const userLink = 'https://twitter.com/USER';

class MessageBody extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      message: null,
      edit: false
    };
    this._bind('renderMedia', 'renderTwitterMedia', 'renderAdminMedia');
  }

  renderMedia() {
    const {type} = this.props;
    switch (type) {
      case 'twitter':
        return this.renderTwitterMedia();
      case 'admin':
        return this.renderAdminMedia();
      default:
        return null;
    }
  }

  renderTwitterMedia() {
    const {meta} = this.props;
    if (meta == null || typeof meta.media == 'undefined') {
      return null;
    }
    let med = meta.media;
    if (typeof meta.media_ext !== 'undefined') {
      med = meta.media_ext;
    }
    let m = med.map((media, i) => {
      switch (media.type) {
        case 'photo':
          return <a key={media.id} href={media.expanded_url} target="_blank">
            <img src={media.media_url_https} width={media.sizes.small.w / 3} height={media.sizes.small.h / 3}/>
          </a>;
        default:
          return null;
      }
    });
    return <div class="media">
      {m}
    </div>;
  }

  renderAdminMedia() {
    if (!this.props.message.picture) {
      return null;
    }
    let {picture} = this.props.message;
    return <a href={picture.original.path} target="_blank">
      <img src={picture.thumb.path} width={picture.thumb.width} height={picture.thumb.height}/>
    </a>;
  }

  render() {
    const {editable} = this.state;
    return <div>{this.props.message.message}{this.renderMedia()}</div>;
  }
}

MessageBody.propTypes = {
  message: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object,
  editable: PropTypes.bool
};

MessageBody.defaultTypes = {
  meta: null,
  editable: false
};

export default MessageBody;