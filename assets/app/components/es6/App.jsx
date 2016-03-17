import {Component} from 'react';
import {Grid} from 'react-bootstrap';
import Navigation from './Navigation';
import Notifications from 'react-notify-toast';

/**
 * File with basic App layout and routes
 */
class App extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <Notifications/>
        <Navigation history={this.props.history}/>
        <Grid>
          {this.props.children}
        </Grid>
      </div>
    );
  }
}

module.exports = App;