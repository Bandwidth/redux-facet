import { facetReducer } from '../../../src';
import { combineReducers } from 'redux-immutable';
import color from '../behaviors/color';

export default (facetName) => facetReducer(facetName, combineReducers({
  color,
}));
