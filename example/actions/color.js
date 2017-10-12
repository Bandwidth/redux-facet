import { createActions } from 'redux-actions';

export default createActions({
  GENERATE_COLOR: {
    PENDING: (delay) => ({ delay }),
    COMPLETE: (color) => ({ color }),
    FAILED: (message) => ({ message }),
  },
});
