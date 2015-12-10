import React from 'react';
import {Button} from 'react-bootstrap';
import {FormattedMessage, defineMessages} from 'react-intl';

const messages = defineMessages({
  login: {
    id: 'login.button.title',
    description: 'Name on login button',
    defaultMessage: 'Login'
  }
});

class Home extends React.Component {
  render () {
    return (
      <Button bgStyle='success'><FormattedMessage {...messages.login}/></Button>
    );
  }
};

module.exports = Home;