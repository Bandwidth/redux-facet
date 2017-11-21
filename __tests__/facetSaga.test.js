import facetSaga from '../src/facetSaga';
import withFacet from '../src/helpers/withFacet';
import { createAction } from 'redux-actions';
import { put, call } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';

describe('facetSaga wrapper', () => {
  const facetName = 'test';
  const addFacet = withFacet(facetName);

  const incomingAction = createAction('INCOMING', data => data);
  const outgoingAction = createAction('OUTGOING', data => data);

  function* basicSaga(action) {
    yield put(outgoingAction(action.payload));
  }

  test('ignores non-facet actions', () => {
    const data = 'foo';
    const iterator = facetSaga(basicSaga)(incomingAction(data));
    expect(iterator.next().value).toEqual(put(outgoingAction(data)));
    expect(iterator.next().done).toBe(true);
  });

  test('mirrors facet name on all outgoing actions', () => {
    const data = 'foo';
    const iterator = facetSaga(basicSaga)(addFacet(incomingAction(data)));
    expect(iterator.next().value).toEqual(put(addFacet(outgoingAction(data))));
    expect(iterator.next().done).toBe(true);
  });

  test('works with effects that yield data', () => {
    const data = 'foo';
    const dataProvider = () => data;

    function* advancedSaga(action) {
      const data = yield call(dataProvider);
      yield put(outgoingAction(data));
    }

    const iterator = facetSaga(advancedSaga)(addFacet(incomingAction()));
    expect(iterator.next().value).toEqual(call(dataProvider));
    expect(iterator.next(data).value).toEqual(
      put(addFacet(outgoingAction(data))),
    );
    expect(iterator.next().done).toBe(true);
  });

  test('handles error control flow', () => {
    const error = new Error('foo');
    const throwFunction = () => null;

    function* advancedSaga(action) {
      try {
        const data = yield call(throwFunction);
        yield put(outgoingAction('wrong'));
      } catch (err) {
        yield put(outgoingAction('right'));
      }
    }

    const iterator = facetSaga(advancedSaga)(addFacet(incomingAction()));
    expect(iterator.next().value).toEqual(call(throwFunction));
    expect(iterator.throw(error).value).toEqual(
      put(addFacet(outgoingAction('right'))),
    );
    expect(iterator.next().done).toBe(true);
  });
});
