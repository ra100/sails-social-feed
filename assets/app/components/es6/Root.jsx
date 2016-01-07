import {Router, Route, Redirect} from 'react-router';
import {Component, PropTypes} from 'react';
import App from './App';
import Home from './Home';
import Login from './Login';

class Root extends Component {

  constructor (props) {
    super(props);
    this.state = {
      history: props.history
    };
  }

  getChildContext() {
    return {user: this.props.user};
  }

  render () {
    const {history} = this.props;
    return (
      <Router history={history}>
        <Route component={App}>
          <Redirect from="/" to="/home"/>
          <Route path="home" component={Home}></Route>
        </Route>
        <Route path="login" component={Login}></Route>
      </Router>
    );
  }
}

Root.propTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

Root.childContextTypes = {
  user: PropTypes.object
};

module.exports = Root;