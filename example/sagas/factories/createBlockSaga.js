// for this example, using a factory function to create sagas for various facets.
// in a more simple saga used by only one facet, you could just create a saga directly.
import { take, call, all, put, fork } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import createFacetChannel from '../../../src/createFacetChannel';
import facetActions from '../../../src/actions/facets';
import colorActions from '../../actions/color';
import tinycolor from 'tinycolor2';

const takeEvery = (channel, saga, ...args) => fork(function*() {
  while (true) {
    const action = yield take(channel);
    yield fork(saga, ...args.concat(action))
  }
});

export default (facetName) => function*() {
  const channel = yield* createFacetChannel(
    facetName,
    colorActions.generateColor.pending.toString()
  );

  function* handleEvents(action) {
    yield put(channel, facetActions.createAlert({
      message: `New color in ${action.payload.delay}ms...`,
      type: 'info',
    }));
    yield call(delay, action.payload.delay);
    const color = yield call(tinycolor.random);
    yield put(channel, colorActions.generateColor.complete(color.toString('hex6')));
  }

  yield takeEvery(channel, handleEvents);
}