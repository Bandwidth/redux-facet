import { combineReducers } from 'redux';
import createCombineFacetReducers from '../factories/createCombineFacetReducers';
import facetReducer from '../facetReducer';

export default createCombineFacetReducers(combineReducers, facetReducer);
