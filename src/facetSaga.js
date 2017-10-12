import { call, put } from 'redux-saga/effects';
import createFacetChannel from './createFacetChannel';
import actions from './actions/facets';

export default (facetName, pattern, saga) => function*() {
  const channel = yield call(createFacetChannel, facetName, pattern);
  const createAlert = (alert) => put(actions.createAlert({ ...alert, facetName }));
  const dismissAlert = (id) => put(actions.dismissAlert({ id, facetName }));
  const dismissAllAlerts = () => put(actions.dismissFacetAlerts({ facetName }));
  return saga(channel, { createAlert, dismissAlert, dismissAllAlerts });
}
