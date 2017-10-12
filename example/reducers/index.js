import { combineReducers } from 'redux-immutable';

/*
  Some webpack magic to collect all the files in this directory into a
  single reducer
*/

// creates a require context for this directory (no subdirectories)
const ctx = require.context('.', false, /.js/);
// filters out this file from the list
const keys = ctx.keys().filter((key) => key !== './index.js');

// maps all filenames, removing the path and file extension and associating them with
// their reducer exports.
const reducerMap = keys.reduce((collection, key) => ({
  ...collection,
  // ctx(key).default here is requiring the module and then taking the 'default' export,
  // necessary due to mismatch between our es6-style modules and the require context's es5.
  [key.replace('./', '').replace('.js', '')]: ctx(key).default,
}), {});

export default combineReducers({
  ...reducerMap,
});
