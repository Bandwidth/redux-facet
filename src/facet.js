import { defaultsDeep, pick } from 'lodash';
import withFacet from './helpers/withFacet';
import { connectAdvanced as defaultConnect } from 'react-redux';
import { withProps } from 'recompose';
import compose from './compose';

export default (facetName, baseMapDispatchToProps, options) => {
  const resolvedOptions = defaultsDeep(options, {
    connect: defaultConnect,
  });

  const selectorFactory = (dispatch, factoryOptions) => {
    // intercepts calls to dispatch, attaching metadata to outgoing actions
    // to indicate which facet they were sent from
    const facetDispatch = action => dispatch(withFacet(facetName)(action));

    return (state, ownProps) => ({
      ...ownProps,
      ...(baseMapDispatchToProps
        ? baseMapDispatchToProps(facetDispatch, ownProps, dispatch)
        : {}),
      facetDispatch,
    });
  };

  return compose(
    withProps({ facetName }),
    resolvedOptions.connect(selectorFactory, {
      methodName: 'facet',
      shouldHandleStateChanges: false,
      getDisplayName: () => `Facet[${facetName}]`,
    }),
  );
};
