import _ from 'lodash';

export default (action) => _.get(action, 'meta.facetName');
