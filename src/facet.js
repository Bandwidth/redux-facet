import _ from 'lodash';
import { createStructuredSelector } from 'reselect';
import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import selectors from './selectors';
import withFacet from './actions/helpers/withFacet';
import facetActions from './actions/facets';

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
export default (
  facetName,
  baseMapStateToProps,
  baseMapDispatchToProps,
  baseMergeProps,
  options = {},
) => (WrappedComponent) => {
  // intercepts calls to dispatch, attaching metadata to outgoing actions
  // to indicate which facet they were sent from
  const mapDispatchToPropsInjectingFacetName = (dispatch, ownProps) => {
    const shimmedDispatch = (action) => dispatch(withFacet(facetName)(action));
    return {
      ...(baseMapDispatchToProps ? baseMapDispatchToProps(shimmedDispatch, ownProps) : {}),

      // also adding some utility action creators
      createAlert: ({ message, type, persistent }) =>
        dispatch(facetActions.createAlert({ message, type, facetName, persistent })),
      dismissAlert: (id) => dispatch(facetActions.dismissAlert(id, facetName)),
      dismissAllAlerts: () => dispatch(facetActions.dismissFacetAlerts(facetName)),
    };
  };

  return compose(
    connect(
      createStructuredSelector({
        alerts: selectors.selectAlerts(facetName),
      }),
      mapDispatchToPropsInjectingFacetName,
      null,
    ),
    connect(
      baseMapStateToProps,
      null,
      baseMergeProps,
      // pass through connect options from HOC options
      _.pick(
        options,
        ['pure', 'areStatesEqual', 'areOwnPropsEqual', 'areStatePropsEqual', 'areMergedPropsEqual', 'storeKey'],
      ),
    ),
  )(WrappedComponent);
};
