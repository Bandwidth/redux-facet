import colorActions from '../../actions/color';
import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const DEFAULT_STATE = fromJS({
  color: '#ffffff',
});

export default () => handleActions({
  GENERATE_COLOR: {
    COMPLETE: (state, { payload: { color } }) => state.set('color', color),
    FAILED: (state) => state.set('color', 'red'),
  },
}, DEFAULT_STATE);
