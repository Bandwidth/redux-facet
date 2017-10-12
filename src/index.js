import createFacetChannel from './createFacetChannel';
import createFacetReducer from './createFacetReducer';
import facet from './facet';
import facetSelectors from './facetSelectors';
import createFacetSaga from './facetSaga';

export default facet;
export const createChannel = createFacetChannel;
export const createReducer = createFacetReducer;
export const selectors = facetSelectors;
export const createSaga = createFacetSaga;
