import { defaultsDeep, pick, isFunction } from 'lodash';
import withFacet from '../helpers/withFacet';
import { connectAdvanced } from 'react-redux';

export default selectors => (facetName, mapFacetStateToProps) => {
  const resolvedFacetName = isFunction(facetName) ? 'prop-provided' : facetName;
  const resolvedMapStateToProps = isFunction(facetName)
    ? facetName
    : mapFacetStateToProps;

  const selectorFactory = (dispatch, factoryOptions) => {
    return (state, ownProps) => {
      const facetState = selectors.createFacetStateSelector(
        ownProps.facetName || resolvedFacetName,
      )(state);
      return {
        ...ownProps,
        ...(resolvedMapStateToProps
          ? resolvedMapStateToProps(facetState, ownProps, state)
          : {}),
      };
    };
  };

  return connectAdvanced(selectorFactory, {
    methodName: 'withFacetData',
    shouldHandleStateChanges: true,
    getDisplayName: name => `WithFacetData[${resolvedFacetName}](${name})`,
  });
};
