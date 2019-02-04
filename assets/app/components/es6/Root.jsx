import {Router, Route, Switch, Redirect} from 'react-router'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Grid} from 'react-bootstrap'
import Navigation from './Navigation'
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
  }

  getChildContext() {
    return {user: this.props.user, socket: this.props.socket, history: this.props.history}
  }

  render() {
    const {history} = this.props
    return (
      <Router history={history}>
        <div>
          <Navigation history={history}/>
          <Grid>
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route path="/home" component={Home}/>
              <Route path="/login" component={Login}/>
              <Route path="/create/stream" component={StreamEdit}/>
              <Route path="/create/feed" component={FeedEdit}/>
              <Route path="/create/group" component={GroupEdit}/>
              <Route path="/create/user" component={UserEdit}/>
              <Route path="/stream/:streamId/edit" component={StreamEdit}/>
              <Route path="/stream/:streamId" component={StreamView}/>
              <Route path="/feed/:feedId/edit" component={FeedEdit}/>
              <Route path="/feed/:feedId" component={FeedEdit}/>
              <Route path="/group/:groupId/edit" component={GroupEdit}/>
              <Route path="/group/:groupId" component={GroupView}/>
              <Route path="/user/:userId/edit" component={UserEdit}/>
              <Route path="/user/:userId" component={UserView}/>
              <Route path="/streams" component={Streams}/>
              <Route path="/users" component={Users}/>
              <Route path="/groups" component={Groups}/>
            </Switch>
          </Grid>
        </div>
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
