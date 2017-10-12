import { combineReducers } from 'redux-immutable';
import createFacetReducer from '../../src/createFacetReducer';
import colorReducer from './behaviors/color';

export default createFacetReducer({
  blockA: colorReducer(),
  blockB: colorReducer(),
  blockC: colorReducer(),
  blockD: colorReducer(),
});
