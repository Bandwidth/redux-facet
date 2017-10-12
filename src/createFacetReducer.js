import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import _ from 'lodash';
import hasFacet from './actions/helpers/hasFacet';

export const ALERTS_KEY = 'reduxFacetAlerts';

export const DEFAULT_STATE = fromJS({
  global: {
    [ALERTS_KEY]: [
      /* alerts will be referenced by id */
    ],
  },
  /* user facets should mimic global */
  [ALERTS_KEY]: {
    /* alerts will be stored by id */
  }
});

const internalReducer = handleActions({
  CREATE_ALERT: (state, { payload, meta: { facetName } }) => state
    // add alert to root collection
    .update(
      ALERTS_KEY,
      fromJS({}), // default if not present
      (alerts) => alerts.set(payload.id, fromJS(payload)),
    )
    // add alert reference to facet
    .updateIn(
      [facetName, ALERTS_KEY],
      fromJS([]), // default if not present
      (alerts) => alerts.push(payload.id),
    ),
  // for this implementation, I'll just delete the alert from the
  // root collection and expect the facets to disregard missing alerts.
  DISMISS_ALERT: (state, { payload: { id }, meta: { facetName } }) => state
    .deleteIn([ALERTS_KEY, id]),
  // iterate through a facet's referenced alerts and dismiss them,
  // then delete the alerts list in the facet for extra cleanup
  DISMISS_FACET_ALERTS: (state, { meta: { facetName } }) => state
    .update(
      ALERTS_KEY,
      (alerts) => {
        const facetAlerts = state.getIn([facetName, ALERTS_KEY]);
        return alerts.filterNot((_alert, key) => facetAlerts.includes(key));
      },
    )
    .setIn([facetName, ALERTS_KEY], fromJS([])),
  // just reset the alerts in the root collection
  DISMISS_ALL_ALERTS: () => state
    .set(ALERTS_KEY, fromJS({})),
}, DEFAULT_STATE);

const filterActions = (reducer, facetName) => (state = reducer.DEFAULT_STATE || fromJS({}), action) => {
  if (hasFacet(facetName)(action)) {
    return reducer(state, action);
  }
  return state;
};

export default (facetReducers, { alertsKey } = { alertsKey: 'facetAlerts' }) => {
  const userReducer = combineReducers({
    ..._.mapValues(facetReducers, filterActions),
    // so combineReducers doesn't get confused
    global: _.identity,
    [ALERTS_KEY]: _.identity,
  });

  return (state = DEFAULT_STATE, action) => {
    const baseState = internalReducer(state, action);
    return userReducer(baseState, action);
  };
};
