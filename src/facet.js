import { defaultsDeep, pick, isFunction, isString } from 'lodash';
import withFacet from './helpers/withFacet';
import { connectAdvanced } from 'react-redux';
import { withProps } from 'recompose';
import compose from './compose';

export default (facetName, baseMapDispatchToProps) => {
  const mapDispatchToProps = isFunction(facetName)
    ? facetName
    : baseMapDispatchToProps;
  const resolvedFacetName = isFunction(facetName) ? 'prop-provided' : facetName;

  const selectorFactory = (dispatch, factoryOptions) => {
    return (state, ownProps) => {
      if (!ownProps.facetName || !isString(ownProps.facetName)) {
        throw new Error(
          `A facet container must be provided with a facetName prop, or a facetName should be specified as its first parameter. facetName must be a String.`,
        );
      }
      // intercepts calls to dispatch, attaching metadata to outgoing actions
      // to indicate which facet they were sent from
      const facetDispatch = action =>
        dispatch(withFacet(ownProps.facetName)(action));

      return {
        ...ownProps,
        ...(mapDispatchToProps
          ? mapDispatchToProps(facetDispatch, ownProps, dispatch)
          : {}),
        facetDispatch,
      };
    };
  };

  const providedProps = isFunction(facetName) ? {} : { facetName };

  return compose(
    withProps(providedProps),
    connectAdvanced(selectorFactory, {
      methodName: 'facet',
      shouldHandleStateChanges: false,
      getDisplayName: name => `Facet[${resolvedFacetName}](${name})`,
    }),
  );
};
