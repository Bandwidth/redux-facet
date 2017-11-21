import { take, call, all, put, fork } from 'redux-saga/effects';
import { delay, takeEvery } from 'redux-saga';
import { facetSaga } from '../../src/immutable';
import colorActions from '../actions/color';
import tinycolor from 'tinycolor2';

function* handleEvents(action) {
  yield call(delay, action.payload.delay);
  const color = yield call(tinycolor.random);
  yield put(colorActions.generateColor.complete(color.toString('hex6')));
}

export default function*() {
  yield fork(
    takeEvery,
    colorActions.generateColor.pending.toString(),
    facetSaga(handleEvents),
  );
}
