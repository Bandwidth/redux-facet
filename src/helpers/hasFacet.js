import _ from 'lodash';

export default (facetName) => (action) => {
  if (!facetName) {
    return !!_.get(action, 'meta.facetName');
  }

  return _.get(action, 'meta.facetName') === facetName;
}
