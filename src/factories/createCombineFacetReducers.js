import _ from 'lodash';

export default (combineReducers, facetReducer) => (reducerMap) => combineReducers(
  _.mapValues(reducerMap, (reducer, key) => facetReducer(key, reducer)),
);
