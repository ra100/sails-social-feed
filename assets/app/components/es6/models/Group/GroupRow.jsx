import {Component, PropTypes} from 'react';
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import {Button} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';

const messages = defineMessages({
  edit: {
    id: 'button.edit',
    description: 'Edit group button',
    defaultMessage: 'Edit'
  }
});

class GroupRow extends Component {

  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      group: props.group
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {formatMessage} = this.props.intl;
    let {group} = this.state;
    return (
      <tr key={group.id}>
        <td>
          <LinkContainer to={'/group/' + group.id}>
            <a>{group.name}</a>
          </LinkContainer>
        </td>
        <td>
          <LinkContainer to={'/group/' + group.id + '/edit'}>
            <Button bsStyle="success">
              <FormattedMessage {...messages.edit}/>
            </Button>
          </LinkContainer>
        </td>
      </tr>
    );
  }
}

GroupRow.contextTypes = {
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
};

GroupRow.propTypes = {
  group: PropTypes.object.isRequired
};

export default injectIntl(GroupRow);