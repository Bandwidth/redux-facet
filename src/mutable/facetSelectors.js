import combineFacetReducers from './combineFacetReducers';

const createFacetStateSelector = facetName => state =>
  state[combineFacetReducers.key][facetName] || {};

export default {
  createFacetStateSelector,
};
