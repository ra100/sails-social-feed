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
      edit: false,
      editable: false
    };
    this._bind('renderMedia');
  }

  renderMedia() {
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
            <img src={media.media_url_https} width={media.sizes.small.w/3} height={media.sizes.small.h/3}/>
          </a>;
        default:
          return null;
      }
    });
    return <div class="media">
      {m}
    </div>;
  }

  render() {
    return <div>{this.props.message}{this.renderMedia()}</div>;
  }
}

MessageBody.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object
};

MessageBody.defaultTypes = {
  meta: null
};

export default MessageBody;