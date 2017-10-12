import React from 'react';
import PropTypes from 'prop-types';

export default class ColorView extends React.Component {
  static propTypes = {
    color: PropTypes.string,
    generateColor: PropTypes.func.isRequired,
  };

  static defaultProps = {
    color: '#ffffff',
  };

  componentDidMount() {
    this.props.generateColor(0);
  }

  handleClick = () => {
    this.props.generateColor(Math.floor(Math.random() * 1000));
  };

  render() {
    const { color } = this.props;
    return (
      <div
        onClick={this.handleClick}
        style={{ width: '25vw', height: '100vh', background: color, cursor: 'pointer' }}
      />
    );
  }
}
