import {Component, PropTypes} from 'react';
import {Button} from 'react-bootstrap';
import {FormattedMessage, defineMessages} from 'react-intl';
import Navigation from './Navigation';

const messages = defineMessages({
  login: {
    id: 'login.button.title',
    description: 'Name on login button',
    defaultMessage: 'Login'
  }
});

class Home extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render () {
    return (
      <div>Welcome {this.context.user.username}!</div>
    );
  }
};

Home.contextTypes = {
  user: PropTypes.object.isRequired
};

module.exports = Home;