import {Router, Route, Redirect} from 'react-router'
import {Component, PropTypes} from 'react'
import App from './App'
import Home from './Home'
import Login from './Login'
import Streams from './models/Stream/Streams'
import StreamEdit from './models/Stream/StreamEdit'
import StreamView from './models/Stream/StreamView'
import FeedEdit from './models/Feed/FeedEdit'
import Groups from './models/Group/Groups'
import GroupEdit from './models/Group/GroupEdit'
import GroupView from './models/Group/GroupView'
import Users from './models/User/Users'
import UserEdit from './models/User/UserEdit'
import UserView from './models/User/UserView'

class Root extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      history: props.history,
      user: props.user,
      socket: props.socket
    }
  }

  getChildContext() {
    return {user: this.state.user, socket: this.state.socket, history: this.state.history}
  }

  render() {
    const {history} = this.props
    return (
      <Router history={history}>
        <Route component={App}>
          <Redirect from="/" to="/home"/>
          <Route path="/home" component={Home}></Route>
          <Route path="/create">
            <Route path="stream" component={StreamEdit}></Route>
            <Route path="feed" component={FeedEdit}></Route>
            <Route path="group" component={GroupEdit}></Route>
            <Route path="user" component={UserEdit}></Route>
          </Route>
          <Route path="/stream">
            <Route path=":streamId" component={StreamView}></Route>
            <Route path=":streamId/edit" component={StreamEdit}></Route>
          </Route>
          <Route path="/feed">
            <Route path=":feedId" component={FeedEdit}></Route>
            <Route path=":feedId/edit" component={FeedEdit}></Route>
          </Route>
          <Route path="/group">
            <Route path=":groupId" component={GroupView}></Route>
            <Route path=":groupId/edit" component={GroupEdit}></Route>
          </Route>
          <Route path="/user">
            <Route path=":userId" component={UserView}></Route>
            <Route path=":userId/edit" component={UserEdit}></Route>
          </Route>
          <Route path="/view">
            <Route path="/streams" component={Streams}></Route>
            <Route path="/users" component={Users}></Route>
            <Route path="/groups" component={Groups}></Route>
          </Route>
        </Route>
        <Route path="/login" component={Login}></Route>
      </Router>
    )
  }
}

Root.propTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}

Root.childContextTypes = {
  history: PropTypes.object,
  user: PropTypes.object,
  socket: PropTypes.object
}

module.exports = Root