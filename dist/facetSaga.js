import createFacetChannel from './createFacetChannel';

export default ((facetName, pattern, saga) => function* () {
  const channel = yield* createFacetChannel(facetName, pattern);
  yield* saga(channel);
});