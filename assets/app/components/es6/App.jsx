import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Root from './Root'
import Notifications from 'react-notify-toast'

/**
 * File with basic App layout and routes
 */
class App extends Component {

  constructor(props, context) {
    super(props, context)
  }

  getChildContext() {
    return {user: this.props.user, socket: this.props.socket, history: this.props.history}
  }

  render() {
    const {history, user, socket} = this.props
    return (
      <div>
        <Notifications/>
        <Root history={history} user={user} socket={socket} />
      </div>
    )
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

App.childContextTypes = {
  history: PropTypes.object,
  user: PropTypes.object,
  socket: PropTypes.object
}

module.exports = App
