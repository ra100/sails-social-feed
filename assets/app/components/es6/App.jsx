import {Component, PropTypes} from 'react';
import Navigation from './Navigation';

/**
 * File with basic App layout and routes
 */

class App extends Component {

  constructor (props, context) {
    super(props, context);
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

module.exports = App;