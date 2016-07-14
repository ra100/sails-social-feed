import {Component, PropTypes,} from 'react';
import {Button} from 'react-bootstrap';
import {FormattedMessage, defineMessages,} from 'react-intl';
import Navigation from './Navigation';

class Home extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return null;
  }
};

Home.contextTypes = {
  user: PropTypes.object.isRequired
};

module.exports = Home;