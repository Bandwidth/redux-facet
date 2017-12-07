import { fromJS } from 'immutable';
import combineFacetReducers from './combineFacetReducers';

const createFacetStateSelector = facetName => state =>
  state.getIn([combineFacetReducers.key, facetName], fromJS({})).toJS();

export default {
  createFacetStateSelector,
};
