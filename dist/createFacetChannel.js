import { channel, takeEvery, buffers } from 'redux-saga';
import { call, put, fork } from 'redux-saga/effects';
import hasFacet from './helpers/hasFacet';
import withFacet from './helpers/withFacet';
import tagDirection from './helpers/tagDirection';

/**
 * Creates a two-way channel which emits actions related to the specified facet. `put` actions back to this channel
 * to associate them back with the facet.
 *
 * @export
 * @param {any} facetName
 */
export default function* (facetName, pattern = '*', buffer = buffers.expanding(10)) {
  const incoming = channel();
  const outgoing = channel();

  // loop A: forward all actions related to this facet to the incoming channel
  function* forwardFacetActions(action) {
    if (!tagDirection.isOutgoing(action) && hasFacet(facetName)(action)) {
      yield put(incoming, tagDirection.tagIncoming(action));
    }
  }

  // loop B: accept outgoing actions from outgoing channel and assign facet name
  function* tagOutgoingActions(action) {
    if (!tagDirection.isIncoming(action)) {
      yield put(withFacet(facetName)(tagDirection.tagOutgoing(action)));
    }
  }

  yield fork(takeEvery, pattern, forwardFacetActions);
  yield fork(takeEvery, outgoing, tagOutgoingActions);

  // crossing the streams!
  // basically, creating a fake channel which allows you to take
  // from incoming and put to outgoing
  return {
    take: incoming.take,
    put: outgoing.put,
    flush: incoming.flush,
    close: () => {
      incoming.close();outgoing.close();
    },
    get __takers__() {
      return incoming.__takers__;
    },
    get __closed__() {
      return outgoing.__closed__;
    }
  };
}