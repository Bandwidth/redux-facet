import { combineReducers } from 'redux-immutable';
import { createReducer } from '../../src';
import colorReducer from './behaviors/color';

export default createReducer({
  blockA: colorReducer(),
  blockB: colorReducer(),
  blockC: colorReducer(),
  blockD: colorReducer(),
});
