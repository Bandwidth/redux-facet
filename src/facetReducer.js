import _ from 'lodash';
import hasFacet from '../helpers/hasFacet';

export default (facetName, reducer, defaultState) => {
  const inferredDefaultState =
    defaultState || reducer(undefined, { type: '@@init' });
  const filteredReducer = (state = inferredDefaultState, action) => {
    if (hasFacet(facetName)(action)) {
      return reducer(state, action);
    }
    return state;
  };

  filteredReducer.facetName = facetName;
  return filteredReducer;
};
