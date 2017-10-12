import colorActions from '../../actions/color';
import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const DEFAULT_STATE = '#ffffff';

export default handleActions({
  GENERATE_COLOR: {
    COMPLETE: (state, { payload: { color } }) => color,
    FAILED: () => 'red',
  },
}, DEFAULT_STATE);
