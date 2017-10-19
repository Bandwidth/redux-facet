const selectFacetState = facetName => state => state[facetName] || {};

export default {
  selectFacetState
};