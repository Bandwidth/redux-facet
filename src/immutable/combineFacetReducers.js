import { combineReducers } from 'redux-immutable';
import createCombineFacetReducers from '../factories/createCombineFacetReducers';
import facetReducer from '../facetReducer';

export default createCombineFacetReducers(combineReducers, facetReducer);
