import _ from 'lodash';
import hasFacet from '../helpers/hasFacet';

export default (baseDefaultState) => (facetName, reducer, defaultState) => {
  const filteredReducer = (state = (defaultState || baseDefaultState), action) => {
    if (hasFacet(facetName)(action)) {
      return reducer(state, action);
    }
    return state;
  };

  filteredReducer.facetName = facetName;
  return filteredReducer;
};
