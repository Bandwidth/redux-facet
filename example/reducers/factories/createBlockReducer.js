import { createReducer } from '../../../src';
import { combineReducers } from 'redux-immutable';
import color from '../behaviors/color';

export default (facetName) => createReducer(facetName, combineReducers({
  color,
}));
