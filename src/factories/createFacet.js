import _ from 'lodash';
import withFacet from '../helpers/withFacet';
import { connect as defaultConnect } from 'react-redux';

/**
 * Wraps a component with a connected Facet. A Facet represents a sub-view in the application,
 * which renders a specific subset of data and performs a limited set of actions. A Facet can be
 * thought of as an augmented 'smart' container. It automatically supplements all action creator functions
 * with metadata about the facet context, and in conjunction with a facet reducer and saga, it will
 * record any errors which occur as a result of actions dispatched from this container and expose
 * them as alerts to be rendered within the contained view component.
 *
 * Note: alerts will not automatically be rendered into your component. You must reference the
 * provided `alerts` prop and choose a logical place to render them yourself.
 */
export default selectors => (
  facetName,
  baseMapStateToProps,
  baseMapDispatchToProps,
  baseMergeProps,
  options,
) => {
  const resolvedOptions = _.defaultsDeep(options, {
    connect: defaultConnect,
  });

  const mapStateToProps = (state, ownProps) => ({
    ...(baseMapStateToProps
      ? baseMapStateToProps(
          state,
          { ...ownProps, facetName },
          // facetName supplied as a third parameter to mapStateToProps
          facetName,
        )
      : {}),
    // facetName will also be supplied as a prop to the component
    facetName,
  });

  // intercepts calls to dispatch, attaching metadata to outgoing actions
  // to indicate which facet they were sent from
  const mapDispatchToPropsInjectingFacetName = (dispatch, ownProps) => {
    const facetDispatch = action => dispatch(withFacet(facetName)(action));
    return {
      ...(baseMapDispatchToProps
        ? baseMapDispatchToProps(facetDispatch, ownProps, dispatch)
        : {}),
      facetDispatch,
    };
  };

  return resolvedOptions.connect(
    mapStateToProps,
    mapDispatchToPropsInjectingFacetName,
    baseMergeProps,
    // pass through connect options from HOC options
    _.pick(resolvedOptions, [
      'pure',
      'areStatesEqual',
      'areOwnPropsEqual',
      'areStatePropsEqual',
      'areMergedPropsEqual',
      'storeKey',
    ]),
  );
};
