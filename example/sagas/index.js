/*
  Some webpack magic to create a root saga which forks all other sagas
  in this directory
*/
import { fork, all } from 'redux-saga/effects';

// creates a require context for this directory (no subdirectories)
const ctx = require.context('.', false, /.js/);
// filters out this file from the list, then maps the filenames to their default exports
const allSagas = ctx.keys().filter((key) => key !== './index.js').map(ctx).map((mod) => mod.default);

export default function* resources() {
  // just map all sagas to the fork effect
  yield all(allSagas.map(fork));
}
