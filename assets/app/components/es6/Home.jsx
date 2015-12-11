import {Component} from 'react';
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
  render () {
    return (
      <div></div>
    );
  }
};

module.exports = Home;