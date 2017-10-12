import { fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { ALERTS_KEY } from './createFacetReducer';

const selectFacetsDomain = () => (state) => state.get('facets');

const selectFacetState = (facetName) => createSelector(
  selectFacetsDomain(),
  (state) => state.get(facetName, fromJS({})),
);

const selectAlerts = (facetName) => createSelector(
  selectFacetsDomain(),
  selectFacetState(facetName),
  (domain, state) => state
    .get(ALERTS_KEY, fromJS([]))
    .map((id) => domain.getIn([ALERTS_KEY, id]))
    .filter((alert) => !_.isUndefined(alert))
    .sort((a, b) => a.get('timestamp', 1) - b.get('timestamp', 0))
    .toJS()
  );

export default {
  selectFacetsDomain,
  selectAlerts,
  selectFacetState,
};
