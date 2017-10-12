// factory function for generating new block containers.
// in a simpler case, you'd just create the containers as normal.
import { createStructuredSelector } from 'reselect';
import facet from '../../src';
import colorActions from '../actions/color';
import colorSelectors from '../selectors/color';
import ColorBlock from '../components/ColorBlock';

export default (facetName) => {
  const mapStateToProps = createStructuredSelector({
    color: colorSelectors.selectColor(facetName),
  });

  const mapDispatchToProps = (dispatch) => ({
    generateColor: (delay) => dispatch(colorActions.generateColor.pending(delay)),
  });

  return facet(
    facetName,
    mapStateToProps,
    mapDispatchToProps,
  )(ColorBlock);
};
