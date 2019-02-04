import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MessageRow from './MessageRow'

class MessageRelated extends Component {
  _bind(...methods) {
    methods.forEach(method => (this[method] = this[method].bind(this)))
  }

  constructor(props, context) {
    super(props, context)
  }

  render() {
    let { related } = this.props
    return (
      <table>
        {related.map(function(m) {
          return <MessageRow message={m} key={m.id} />
        })}
      </table>
    )
  }
}

MessageRelated.propTypes = {
  related: PropTypes.array.isRequired
}

export default MessageRelated
