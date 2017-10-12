import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import _ from 'lodash';
import hasFacet from './helpers/hasFacet';

export default (facetName, reducer) => (state = reducer.DEFAULT_STATE || fromJS({}), action) => {
  if (hasFacet(facetName)(action)) {
    return reducer(state, action);
  }
  return state;
};
