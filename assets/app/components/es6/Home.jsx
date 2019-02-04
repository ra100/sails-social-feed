import React, {Component} from 'react'
import PropTypes from 'prop-types'

class Home extends Component {

  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <h3>
        Shoutbox Admin
      </h3>
    )
  }
};

Home.contextTypes = {
  user: PropTypes.object.isRequired
}

module.exports = Home
