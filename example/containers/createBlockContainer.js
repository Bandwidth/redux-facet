// factory function for generating new block containers.
// in a simpler case, you'd just create the containers as normal.
import facet, { compose, withFacetData } from '../../src/immutable';
import { createStructuredSelector } from 'reselect';
import colorActions from '../actions/color';
import colorSelectors from '../selectors/color';
import ColorBlock from '../components/ColorBlock';

export default facetName => {
  const mapStateToProps = createStructuredSelector({
    color: colorSelectors.selectColor,
  });

  const mapDispatchToProps = dispatch => ({
    generateColor: delay => dispatch(colorActions.generateColor.pending(delay)),
  });

  return compose(
    facet(facetName, mapDispatchToProps),
    withFacetData(facetName, mapStateToProps),
  )(ColorBlock);
};
