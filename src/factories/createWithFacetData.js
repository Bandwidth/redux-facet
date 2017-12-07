import { defaultsDeep, pick } from 'lodash';
import withFacet from '../helpers/withFacet';
import { connectAdvanced as defaultConnect } from 'react-redux';

export default selectors => (facetName, mapFacetStateToProps, options) => {
  const resolvedOptions = defaultsDeep(options, {
    connect: defaultConnect,
  });

  const selectorFactory = (dispatch, factoryOptions) => {
    return (state, ownProps) => {
      const facetState = selectors.createFacetStateSelector(facetName)(state);
      console.log(`facet ${facetName} state ${JSON.stringify(facetState)}`);
      return {
        ...ownProps,
        ...(mapFacetStateToProps
          ? mapFacetStateToProps(facetState, ownProps, state)
          : {}),
      };
    };
  };

  return resolvedOptions.connect(selectorFactory, {
    methodName: 'withFacetData',
    shouldHandleStateChanges: true,
    getDisplayName: () => `WithFacetData[${facetName}]`,
  });
};
