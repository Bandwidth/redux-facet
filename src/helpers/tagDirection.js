export default {
  tagIncoming: (action) => ({
    ...action,
    meta: {
      ...action.meta,
      facetChannelDirection: 'incoming',
    },
  }),

  tagOutgoing: (action) => ({
    ...action,
    meta: {
      ...action.meta,
      facetChannelDirection: 'outgoing',
    },
  }),

  isIncoming: (action) => action.meta && action.meta.facetChannelDirection === 'incoming',
  isOutgoing: (action) => action.meta && action.meta.facetChannelDirection === 'outgoing',
};
