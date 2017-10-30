import { createSelector } from 'reselect';
import { selectors } from '../../src/immutable';

export default {
  selectColor: facetName =>
    createSelector(selectors.createFacetStateSelector(facetName), state =>
      state.get('color'),
    ),
};
