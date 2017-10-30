import _ from 'lodash';

const KEY = 'facets';

export default (combineReducers, facetReducer) => {
  const combiner = reducerMap =>
    combineReducers(
      _.mapValues(reducerMap, (reducer, key) => facetReducer(key, reducer)),
    );

  combiner.key = KEY;
  return combiner;
};
