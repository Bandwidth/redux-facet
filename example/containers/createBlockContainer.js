// factory function for generating new block containers.
// in a simpler case, you'd just create the containers as normal.
import facet, { createStructuredFacetSelector } from '../../src/immutable';
import colorActions from '../actions/color';
import colorSelectors from '../selectors/color';
import ColorBlock from '../components/ColorBlock';

export default facetName => {
  const mapStateToProps = createStructuredFacetSelector({
    color: colorSelectors.selectColor,
  });

  const mapDispatchToProps = dispatch => ({
    generateColor: delay => dispatch(colorActions.generateColor.pending(delay)),
  });

  return facet(facetName, mapStateToProps, mapDispatchToProps)(ColorBlock);
};
