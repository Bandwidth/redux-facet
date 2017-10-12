import { all, fork } from 'redux-saga/effects';
import createBlockSaga from './factories/createBlockSaga';

export default function*() {
  yield all(['blockA', 'blockB', 'blockC', 'blockD'].map(createBlockSaga).map(fork));
}
