var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Assigns the provided facetName to the meta of the created action
 */
export default (facetName => action => facetName ? _extends({}, action, {
  meta: _extends({}, action.meta, {
    facetName
  })
}) : action);