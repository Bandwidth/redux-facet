import { createActions } from 'redux-actions';
import uuid from 'uuid';

const generateAlertId = (timestamp) => `alert-${timestamp}-${uuid().substring(0, 18)}`;
const createTimestamp = () => (new Date()).getTime();

export default createActions({
  CREATE_ALERT: [
    ({ message, type }) => {
      const timestamp = createTimestamp();
      return {
        id: generateAlertId(timestamp),
        timestamp,
        message,
        type,
      };
    },
    ({ facetName = 'global' }) => ({ facetName }),
  ],
  DISMISS_ALERT: [
    (id) => ({ id }),
    (id, facetName = 'global') => ({ facetName }),
  ],
  DISMISS_FACET_ALERTS: [
    () => ({}),
    (facetName = 'global') => ({ facetName }),
  ],
  DISMISS_ALL_ALERTS: () => ({}),
});
