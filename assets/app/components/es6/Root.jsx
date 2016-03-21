import {Router, Route, Redirect} from 'react-router';
import {Component, PropTypes} from 'react';
import App from './App';
import Home from './Home';
import Login from './Login';
import StreamEdit from './models/Stream/StreamEdit';
import GroupEdit from './models/Group/GroupEdit';
import GroupView from './models/Group/GroupView';
import Groups from './models/Group/Groups';
import Users from './models/User/Users';
import UserEdit from './models/User/UserEdit';
import UserView from './models/User/UserView';

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      history: props.history,
      user: props.user,
      socket: props.socket
    };
  }

  getChildContext() {
    return {user: this.state.user, socket: this.state.socket};
  }

  render() {
    const {history} = this.props;
    return (
      <Router history={history}>
        <Route component={App}>
          <Redirect from="/" to="/home"/>
          <Route path="/home" component={Home}></Route>
          <Route path="/create">
            <Route path="stream" component={StreamEdit}></Route>
            <Route path="group" component={GroupEdit}></Route>
            <Route path="user" component={UserEdit}></Route>
          </Route>
          <Route path="/group/:groupId" component={GroupView}></Route>
          <Route path="/group/:groupId/edit" component={GroupEdit}></Route>
          <Route path="/user/:userId" component={UserView}></Route>
          <Route path="/user/:userId/edit" component={UserEdit}></Route>
          <Route path="/view">
            <Route path="/users" component={Users}></Route>
            <Route path="/groups" component={Groups}></Route>
          </Route>
        </Route>
        <Route path="/login" component={Login}></Route>
      </Router>
    );
  }
}

Root.propTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

Root.childContextTypes = {
  user: PropTypes.object,
  socket: PropTypes.object
};

module.exports = Root;