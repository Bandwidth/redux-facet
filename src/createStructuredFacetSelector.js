import _ from 'lodash';

export default (facetSelectorCreators, globalSelectors) => (
  state,
  ownProps,
) => ({
  ..._.mapValues(facetSelectorCreators, selectorCreator =>
    selectorCreator(ownProps.facetName)(state),
  ),
  ..._.mapValues(globalSelectors, selector => selector(state)),
});
