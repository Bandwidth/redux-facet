import React from 'react';
import PropTypes from 'prop-types';

const alertStyles = { cursor: 'pointer', padding: '8px', border: '1px solid white', background: 'rgba(255, 255, 255, 0.5)' };

export default class ColorView extends React.Component {
  static propTypes = {
    alerts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      timestamp: PropTypes.number.isRequired,
      message: PropTypes.string,
      type: PropTypes.string,
    })),
    dismissAlert: PropTypes.func.isRequired,
    createAlert: PropTypes.func.isRequired,
    color: PropTypes.string,
    generateColor: PropTypes.func.isRequired,
  };

  static defaultProps = {
    alerts: [],
    color: '#ffffff',
  };

  componentDidMount() {
    this.props.createAlert({
      message: 'Click the background to change color. Click any alert to dismiss it.',
      type: 'info'
    });
    this.props.generateColor(0);
  }

  handleClick = () => {
    this.props.generateColor(Math.floor(Math.random() * 1000));
  };

  createAlertClickHandler = (id) => (ev) => {
    ev.stopPropagation();
    this.props.dismissAlert(id);
  };

  render() {
    const { alerts, color } = this.props;
    return (
      <div
        onClick={this.handleClick}
        style={{ width: '25vw', height: '100vh', background: color, cursor: 'pointer' }}
      >
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={alertStyles}
            onClick={this.createAlertClickHandler(alert.id)}
          >
            {alert.message}
          </div>
        ))}
      </div>
    );
  }
}
