# redux-facet

## Purpose

In Redux, all actions share the same channel. Creating reusable action creators and reducer behaviors is hard, because you need a method with which to associate different results of those actions with different parts of the application. Without a plan to address this, actions and reducers are often duplicated: `createGlobalAlert`, `createUsersAlert`, `createPostsAlert`, etc...

`redux-facet` aims to build a pattern which makes it easy to write one set of actions and one reducer, then reuse that behavior in various 'facets' of your application.

```javascript
import facet, {
  combineFacetReducers,
  createStructuredFacetSelector,
} from '@bandwidth/redux-facet';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDom from 'react-dom';

import userListReducer from 'reducers/userList';
import alertsReducer from 'reducers/common/alerts';
import alertsActions from 'actions/common/alerts';

/**
 * Creating the root reducer
 */
const reducer = combineReducers({
  [combineFacetReducers.key]: combineFacetReducers({
    users: combineReducers({
      alerts: alertsReducer,
      list: userListReducer,
    }),
    posts: combineReducers({
      alerts: alertsReducer,
    }),
    /* ... other facet reducers */
  });
  /* ... other reducers */
});

/**
 * Creating the store, as usual
 */
const store = createStore(reducer, {});

/**
 * Creating views for the data
 */
const AlertsView = ({ alerts }) => (
  <div>
    {alerts.map(alert => <div>{alert}</div>)}
  </div>
);
const UsersView = ({ users, alerts, createAlert }) => (
  <div>
    <AlertsView alerts={alerts} />
    <ul>
      {
        users.map(
          user => (
            <li onClick={() => createAlert(`Clicked ${user.name}`)}>{user.name}</li>
          )
        )
      }
    </ul>
  </div>
);
const PostsView = ({ alerts, createAlert }) => (
  <div>
    <AlertsView alerts={alerts} />
    <div>No alerts from users will show up here</div>
  </div>
);

/**
 * Selectors designed for use with facets
 */
const selectList = facetName => state => state[facetName].list;
const selectAlerts = facetName => state => state[facetName].alerts;

/**
 * Using named facet containers instead of default react-redux containers
 */
const UsersContainer = facet(
  'users',
  createStructuredFacetSelector({ users: selectList, alerts: selectAlerts }),
  (dispatch) => ({ createAlert: (message) => dispatch(alertsActions.create(message)) }),
)(UsersView);

const PostsContainer = facet(
  'posts',
  createStructuredFacetSelector({ alerts: selectAlerts }),
  (dispatch) => ({ createAlert: (message) => dispatch(alertsActions.create(message)) }),
)(PostsView);

/**
 * Rendering everything
 */
ReactDom.render(
  <Provider store={store}>
    <div>
      <UsersContainer />
      <PostsContainer />
    </div>
  </Provider>
);
```

In the example above, both the `users` and `posts` facets of the application can reuse the same action creators, reducers, and components to manage their alert systems, but the alerts they create will never cross the boundaries between them. `redux-facet` ensures the actions reach the correct reducer, and the state is separated out in the selectors by facet name before reaching the view.

## Immutable.js Support

To use `redux-facet` with `immutable`, import all modules from `@bandwidth/redux-facet/immutable`. Module names and usages stay the same.

## Documentation

### `facet(facetName: String?, mapFacetDispatchToProps: Function)`

Think of `facet()` kind of like `connect()`, but only for actions. It's a wrapper around `connectAdvanced` which ensures that all actions dispatched by the wrapped component will be tracked with your facet name.

For an action creator,

```javascript
const getUser = (id) => ({
  type: 'GET_USER',
  payload: { id },
});
```

using `facet` as follows

```javascript
facet(
  'usersList',
  (dispatch) => { getUser: (id) => dispatch(getUser(id)) },
)(Component);
```

when the component calls `getUser(id)`, the resulting action will look like this:

```javascript
{
  type: 'GET_USER',
  payload: { id },
  meta: { facetName: 'usersList' },
}
```

That's all that `facet()` does!

#### Parameters

`facet` takes two parameters. The first is `facetName`, which is optional. This lets you specify the name of the facet this container is attached to at the container level. If it's omitted, you *must* provide the `facetName` prop to the container.

The second parameter is `mapFacetDispatchToProps`, a function which, as previously mentioned, is very similar to `mapDispatchToProps` in `connect`. If you omit `facetName`, you can pass this as the first and only parameter.

Though simple, `facet()` allows action creators to be written once and reused anywhere without creating ambiguity of which portion of the app generated the action. When coupled with `facetReducer`, this allows actions to be tracked and associated with specific sections of the Redux state.

### withFacetData(facetName: String?, mapFacetStateToProps: Function)

The other half of a `connect` container, this higher-order-component lets you retrieve data from a facet's sub-state in your redux store.

`mapFacetStateToProps` will be called with the parameters `(facetState, ownProps, state)`, where `facetState` is the sub-state located at `facets[facetName]`, and `state` is the unfiltered original state.

Similar to `facet`, you can omit `facetName` and provide it as a prop instead, which would make the only parameter `mapFacetStateToProps`.

The advantage of using `withFacetData` over `connect` for selecting facet data is that you can write generic selectors which are portable between different named facets.

### facetReducer(facetName: String, reducer: Function)

> Note: for basic usage, be sure to also see `combineFacetReducers` below.

Wrap a reducer in `facetReducer` to restrict it to use only actions which were dispatched from the corresponding facet.

Now that only outgoing actions that are tagged with `facet()` will be processed by this reducer, you are free to extract and reuse the business logic of the reducer funciton itself.

```javascript
// a general reducer that can add and clear alert ids. In this scenario,
// let's suppose that these ids are referencing a normalized collection
// of alerts mounted in our global state.
const alertReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ALERT':
      return [
        ...state,
        action.payload.alert.id,
      ];
    case 'DISMISS_ALERTS':
      return [];
  }
};

// now the alert reducer can be reused for various different parts of the app
const rootReducer = combineReducers({
  facets: combineReducers({
    users: facetReducer('users', combineReducers({
      alerts: alertReducer,
    })),
    posts: facetReducer('posts', combineReducers({
      posts: alertReducer,
    })),
  }),
});
```

Unlike if `alertReducer` had been simply mounted as-is, the `posts` will only process `"ADD_ALERT"` events which are related to the `posts` facet. Same with `users`.

#### One Rule: Mount a facet reducer at `facets.<facetName>`

Presently, `redux-facet` expects a reducer which controls the state of a facet to be mounted at the facet's name within a part of the state called `facets`. For instance, in the `rootReducer` above, `users` and `posts` are mounted correctly. `combineFacetReducers` was designed to make this more idiomatic.

### combineFacetReducers(reducerMap: Object)

`combineFacetReducers` is the analogue of `combineReducers`. It has the same usage as the default Redux tool. Simply supply it with a map of reducers, where the key for each reducer is the name of the reducer's facet. `combineFacetReducers` will automatically apply `facetReducer` to your reducers utilizing the key and combine them into one function.

Mount the result of `combineFacetReducers` at the key provided as a property of the function as shown below. This ensures that even if `redux-facet` changes the place it expects this reducer to be mounted, your code won't need updating. Presently, the value of the key is simply `'facets'`.

```javascript
const rootReducer = combineReducers({
  [combineFacetReducers.key]: combineFacetReducers({
    users: userReducer,
    posts: postReducer,
  });
});
```

### facetSaga(saga: Function)

For those who use `redux-saga`, this library also provides a wrapper for sagas which will ensure all actions which are dispatched by the saga will mirror the facet of the action which triggers it.

This helps fulfill the goal of `redux-facet`: to transparently track actions as they move through your application.

In combination with generic facet behaviors, this becomes a powerful tool for writing reusable code.

For example, we can write a generic list request handler saga which can also dispatch error messages to the facet which originally requested the list:

```javascript
const handleListSaga = function*(action) {
  try {
    const response = yield call(api.fetch, action.payload.details);
    yield put(listActions.listComplete(response));
  } catch (err) {
    // this outgoing action will be tagged with the initiating facet,
    // so we can correlate the alert message with the correct part of the UI
    // when we render... all without writing any specific logic.
    yield put(alertActions.create(err.message));
  }
};

const watchList = function*() {
  yield takeEvery('LIST_REQUESTED', facetSaga(handleListSaga));
};
```

Taking this example, let's suppose that two different pages in our application dispatch a `LIST_REQUESTED` action. If the request fails on `pageA`, an error alert action will be dispatched which is tagged with `pageA` as the facet metadata. We can then choose to only render that alert on `pageA`. This pattern helps keep our alert messaging tied closely to the actual point of user interaction and avoids littering our page with global alerts or multiple alerts.

For more information on alerts specifically, be sure to check out [redux-facet-alerts](https://github.com/Bandwidth/redux-facet-alerts). Of course, this pattern can be applied to any generalized behavior you want to repeat in your application.

### `selectors`

`redux-facet` exports a selector creator to select facet state from the store by name. You can access it by calling `selectors.createFacetStateSelector(facetName)`. Calling the returned function with your store will return the state of that facet in plain JS, even if immutables are used.

### `createStructuredFacetSelector(facetSelectorCreators: Object, normalSelectors?: Object)`

Similar to `createStructuredSelector` of `reselect`, but instead of selectors, it expects to be passed a map of "facet selector creators". A facet selector creator is a function which takes `facetName` as a parameter and returns a selector, like so:

```javascript
const fooSelectorCreator = facetName => createSelector(
  createFacetStateSelector(facetName),
  state => state.get('foo'),
);
```

Such a function creates a selector which returns state based on the facet name supplied.

If you need to supply more parameters to your selector creator, you can take it one level deeper by creating a selector creator creator:

```javascript
const filteredFooSelectorCreator = filterFunction => facetName => createSelector(
  createFacetStateSelector(facetName),
  state => state.get('foo').filter(filterFunction),
);
```

Once you have facet selector creators, supply them to `createStructuredFacetSelector`:

```javascript
const mapStateToProps = createStructuredFacetSelector({
  fooSelectorCreator,
  filteredFooSelectorCreator(foo => foo.isEnabled),
});
```

`createStructuredFacetSelector` will automatically call all selector creator functions you supply with the facet name.

You can use the second parameter of `createStructuredFacetSelector` to provide a map of typical selectors, just like you would to `createStructuredSelector`.

```javascript
const mapStateToProps = createStructuredFacetSelector({
  fooSelectorCreator,
  filteredFooSelectorCreator(foo => foo.isEnabled),
}, {
  normalState: normalSelectorCreator(someArgument),
});
```

### `getFacet(action: Object)`

Returns the facet name which this action has been tagged with.

### `hasFacet(facetName: String) => (action) => true|false`

A 'thunk' which creates a function which takes an action and returns whether or not the action has the specified facet name. Usage: `hasFacet('users')(someAction)`

### `withFacet(facetName: String) => (action) => taggedAction`

A 'thunk' which creates a function which will tag an action with the specified facet name. General usage will probably be to wrap an action creator. For example: `withFacet('users')(createSomeAction(foo, bar))`
