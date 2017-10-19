import { fromJS } from 'immutable';

const selectFacetState = facetName => state => state.get(facetName, fromJS({}));

export default {
  selectFacetState
};