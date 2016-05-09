import {Component, PropTypes} from 'react';

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
    this._bind();
  }

  render() {
    return '';
  }
}

MessageBody.propTypes = {
  message: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired
};

export default MessageBody;