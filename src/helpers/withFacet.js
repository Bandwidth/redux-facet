/**
 * Assigns the provided facetName to the meta of the created action
 */
export default (facetName) => (action) =>
(facetName ? {
  ...action,
  meta: {
    ...action.meta,
    facetName,
  },
} : action);
