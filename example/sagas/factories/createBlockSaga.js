// for this example, using a factory function to create sagas for various facets.
// in a more simple saga used by only one facet, you could just create a saga directly.
import { take, call, all, put, fork } from 'redux-saga/effects';
import { delay, takeEvery } from 'redux-saga';
import { createChannel, createSaga } from '../../../src';
import colorActions from '../../actions/color';
import tinycolor from 'tinycolor2';

export default (facetName) => createSaga(
  facetName,
  colorActions.generateColor.pending.toString(),
  function*(channel) {
    function* handleEvents(action) {
      yield call(delay, action.payload.delay);
      const color = yield call(tinycolor.random);
      yield put(channel, colorActions.generateColor.complete(color.toString('hex6')));
    }
    yield takeEvery(channel, handleEvents);
  },
);
