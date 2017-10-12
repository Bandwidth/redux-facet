import createFacetChannel from './createFacetChannel';
import createFacetReducer from './createFacetReducer';
import facet from './facet';
import facetActions from './facetActions';
import facetSelectors from './facetSelectors';

export default facet;
export const createChannel = createFacetChannel;
export const createReducer = createFacetReducer;
export const actions = facetActions;
export const selectors = facetSelectors;
