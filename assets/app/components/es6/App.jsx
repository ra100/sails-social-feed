import {Component} from 'react';
import Navigation from './Navigation';

/**
 * File with basic App layout and routes
 */

class App extends Component {
  render () {
    return (
      <div>
        <Navigation />
        {this.props.children}
      </div>
    );
  }
}

module.exports = App;