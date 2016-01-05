import {Component, PropTypes} from 'react';
import Navigation from './Navigation';

/**
 * File with basic App layout and routes
 */

class App extends Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div>
        <Navigation history={this.props.history}/>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired
};

module.exports = App;