import {Router, Route, Redirect} from 'react-router';
import {Component, PropTypes} from 'react';
import App from './App';
import Home from './Home';
import Login from './Login';
import StreamCreate from './models/Stream/StreamCreate';
import GroupCreate from './models/Group/GroupCreate';
import GroupView from './models/Group/GroupView';

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
    return {user: this.state.user, socket: this.state.socket,};
  }

  render() {
    const {history} = this.props;
    return (
      <Router history={history}>
        <Route component={App}>
          <Redirect from="/" to="/home"/>
          <Route path="/home" component={Home}></Route>
          <Route path="/create">
            <Route path="stream" component={StreamCreate}></Route>
            <Route path="group" component={GroupCreate}></Route>
          </Route>
          <Route path="/group/:groupId" component={GroupView}></Route>
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