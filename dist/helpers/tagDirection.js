var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

export default {
  tagIncoming: action => _extends({}, action, {
    meta: _extends({}, action.meta, {
      facetChannelDirection: 'incoming'
    })
  }),

  tagOutgoing: action => _extends({}, action, {
    meta: _extends({}, action.meta, {
      facetChannelDirection: 'outgoing'
    })
  }),

  isIncoming: action => action.meta && action.meta.facetChannelDirection === 'incoming',
  isOutgoing: action => action.meta && action.meta.facetChannelDirection === 'outgoing'
};