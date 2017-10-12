import { createSelector } from 'reselect';
import selectors from '../../src/selectors';

export default {
  selectColor: (facetName) => createSelector(
    selectors.selectFacetState(facetName),
    state => state.get('color'),
  ),
};