# redux-facet

A pattern for tracking and channeling actions according to the container they were dispatched from.

## The Problem

You have a behavior for keeping track of pagination state which you want to replicate to various lists across your app. In order to do that right now, you have to have `usersListActions.setPage`, `postsListActions.setPage`, etc, etc, as well as duplicated logic in reducers. You decide to create a generic set of actions for pagination events, `paginationActions`, and a generic reducer for handling pagination, `paginationReducer`.

Now you supply those actions to your list containers, `UsersList` and `PostsList`, and you mount that reducer in the state for both collections, at `users.pagination` and `posts.pagination`.

```javascript
// reducers/usersList.js, reducers/postsList.js
export default combineReducers({
  pagination: paginationReducer,
  foo: fooReducer,
  /* ... etc ... */
});

// containers/UsersList/index.js, containers/PostsList/index.js
const mapStateToProps = (state) => ({ /* ... */ });

const mapDispatchToProps = (dispatch) => ({
  setPage: (page) => dispatch(paginationActions.setPage(page)),
  // ...
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
```

When you run the app and go to page 2 of Users, it goes to page 2 of Posts as well. Your actions have no way of indicating which list they came from, and even if they did, both of your reducers will trigger off any particular pagination action anyway.

```
Incoming Action     | State Diff
--------------------|---------------------------
{                   |   {
  type: 'SET_PAGE', |     usersList: {
  payload: {        |       pagination: {
    page: 3         | -       page: 0
  }                 | +       page: 3
}                   |       }
                    |     },
                    |     postsList: {
                    |       pagination: {
                    | -       page: 6
                    | +       page: 3
                    |       }
                    |     }
                    |   }
```

How can we solve this? We could add a tag in the `meta` properties of each action which indicates whether the action came from `UsersList` or `PostsList`. That's simple enough, just add a parameter to the action creators. But it is kind of tedious and smelly to provide a magic string every time you create an action.

```javascript
const createSetPageAction = ({ page, origin }) => ({
  type: 'SET_PAGE',
  payload: { page },
  meta: { origin },
});
```

Then there's the matter of the reducers. Each one will have to filter for actions which came from the right collection. We could turn our reducer into a reducer factory, and only trigger it when the origin matches what we expect:

```javascript
const createFilteredPaginationReducer =
  (originName) =>
  (state, action) => {
    if (action.meta.origin = originName) {
      return paginationReducer(state, action);
    } else {
      return state;
    }
  }
```

That will work pretty smoothly:

```javascript
const baseUserReducer = (state, action) => {
  /* unique logic for users */
};
const userPaginationReducer =
  createFilteredPaginationReducer('users');
const userReducer = (state, action) => ({
  ...baseUserReducer(state, action),
  pagination: userPaginationReducer(state, action),
});
```

You might even be able to streamline it a bit. But what's unavoidably emerging here is the complexity of having to tag and filter everything which used to be very straightforward. At this point you're committing to coding by convention, with every developer understanding the requirements of tagging and filtering actions. And we haven't even covered selectors yet, or sagas. Imagine if you had to write logic in all your sagas to make sure that the tag on an incoming action was replicated to all resulting actions! I did it-- it wasn't fun or maintainable.

So, we might give up and go back to duplicating reducer logic and actions across various parts of the app.

Or, we could try to capture all that complexity into a reusable library. That's `redux-facet`.

## The Solution

The idea behind `redux-facet` is to improve the ability of a Redux developer (you?) to extract common patterns in their application logic into easily reusable patterns without getting lost in the weeds of sorting out what actions and state are associated with what parts of the application. Why can't our code do that for us?

As an app increases in scope, it's likely you'll find yourself writing the same actions, reducers, and sagas again for different resources or datasets. If you get an itch to extract those repeated patterns into reusable code, but can't quite figure out how to keep things straight, perhaps Facets are the solution.

Let's look at the new code:

### Containers (now Facets)

A Facet is analogous to a Redux Container, but it modifies incoming and outgoing data to reflect the Facet they're associated with. Ougoing actions are tagged automatically, and incoming state is sliced down to just the section the Facet controls (don't worry, you can still access unfiltered dispatching and global state if you need them).

```javascript
// facets/UsersList/index.js

import facet from 'redux-facet';
// actions can stay generic and reusable:
import actions from '../../actions/pagination';
// selectors must still be aligned to the facet
import selectors from '../../selectors/pagination';
// typical view component for the container
import View from './View';

export const NAME = 'usersList';

// mapStateToProps is supplied with the facet-specific state view.
// the global state is supplied as a third parameter
const mapStateToProps = (facetState, ownProps, globalState) => ({
  pageNumber: selectors.selectPageNumber(facetState),
  /* ... etc ... */
});

// mapDispatchToProps is supplied with a facet-specific dispatch function
// the default dispatch is supplied as a third parameter
const mapDispatchToProps = (facetDispatch, ownProps, globalDispatch) => ({
  setPage: (page) => facetDispatch(actions.setPage(page)),
});

// facet works just like connect
export default facet(
  NAME,
  mapStateToProps,
  mapDispatchToProps,
)(View);
```

That covers the Container. As you can see, the only things we really changed were using `facet` instead of `connect`, and modifying our `mapStateToProps` and `mapDispatchToProps` to understand that the parameters supplied are relative to our Facet.

### Action Creators

We don't need to make any modifications to our action creators. Actions will be tagged automatically by the Facet when they're dispatched.

### Reducers

Using Facets, it starts to make sense to make a distinction between typical one-off reducers, and reducers which maintain a portion of state that is repeatable across various parts of the tree (i.e., our pagination example).

For the latter, repeatable reducers, we don't need to make any changes, we just have to mount them in various other reducers across our app.

Now, we need to create the reducer that will handle the portion of the state tree for our Facet:

```javascript
import { facetReducer } from 'redux-facet';
import { combineReducers } from 'redux-immutable';
import { NAME } from '../facets/UsersList';
// our 'common' pagination reducer
import pagination from './behaviors/pagination';

// the facetReducer function filters incoming actions by facet name
export default facetReducer(NAME, combineReducers({
  // simply mount our common reducer into our facet reducer
  pagination,
  // we can, of course, include other custom behaviors or whatever
  // else we want in this reducer.
  someCustomStuff: someOtherReducer,
}));
```

`facetReducer` filters all incoming actions by the Facet name. That means your reducer function won't receive any actions that weren't dispatched from your Facet (or manually tagged as if they were).

That may seem limiting, but the limitation can also help organize your store and keep boundaries specific. If it's a problem, you can always skip `facetReducer` and write your own reducer that checks for a Facet name only when you want it to. You can also selectively apply `facetReducer` to sub-reducers, like so:

```javascript
export default combineReducers({
  // using facetReducer here ensures our pagination is filtered to
  // our facet only, so it won't pick up pagination actions from other facets
  facetReducer(NAME, pagination),
  // ... but the other reducers will still all get every single action that
  // redux dispatches.
  handlesGlobalActions: someOtherReducer,
});
```

### Selectors

We don't need to do anything special to the selectors, either. Since our `mapStateToProps` within our Facet will automatically select our Facet's portion of the state tree, we can write our selectors that will work in any Facet. If you need access to the global state in your selector, you can find it passed as the third parameter in `mapStateToProps`.

### Sagas

Previously I mentioned that sagas can be really annoying with the ad-hoc pattern. The problem is, you need to ensure that meta tags are propagated from initiating actions to all other actions which are created by the saga, or it becomes impossible to track multi-action operations as they unfold.

With `redux-facet`, you can wrap your sagas with a function that provides a channel. If you're not familiar with channels in redux-saga, you can think of them as event sources which a saga can `take` from and `put` to, just like the Redux action stream.

Now, the only difference with your wrapped saga is that you must `take` from and `put` to the provided channel. You don't need to be concerned with Facets beyond that; the channel itself will filter for actions related to your Facet, and attach Facet meta tags to all outgoing actions.

```javascript
import { take, call, all, put, fork } from 'redux-saga/effects';
import { delay, takeEvery } from 'redux-saga';
import { facetSaga } from 'redux-facet';
import { NAME } from '../facets/UsersList';
// in this hypothetical case, perhaps 'list' itself
// is able to be generalized so that its actions can be used
// between all sorts of collections
import actions from '../actions/list';
import apiClient from '../myApiClient';

export default facetSaga(
  NAME, // the name of your facet
  'LIST_PENDING', // any redux-saga pattern for selecting actions to listen for

  // your saga
  function*(channel) {
    // the channel is set up to filter for only actions which relate
    // to the saga, and match the pattern you provided (which can be '*')

    // creating a handler for incoming actions
    function* handleListPending(action) {
      const response = yield call(apiClient, action.payload.listOptions);
      // put to the channel to dispatch actions
      yield put(channel, actions.listComplete(response));
    }

    // use take, takeLatest, takeEvery like normal, but supply
    // the channel as the first argument.
    // unfortunately, redux-saga's take effects don't support
    // supplying a channel and a pattern at the same time, hence
    // the presence of the pattern as the second parameter of facetSaga
    yield takeEvery(channel, handleListPending);
  },
);
```

## Example

If you're having trouble seeing the big picture here and would rather see a working sample, take a look at the `example` folder. Inside is a simple little Redux app with four big colored blocks. If you click one, its color will change after a bit. It demonstrates a very trivial example of what facets enable.

The actions to request new colors, the reducer to construct color state, and the saga to perform the generation are all generalized and reusable. They don't 'belong' to any particular color block.

The blocks all dispatch the same types of actions, but each one is tagged so that it corresponds to its source block, so the requests to change colors never get crossed.

This example is probably somewhat poor because all the blocks look and behave similarly. In reality, they are all distinct containers. I'll see if I can make a better example soon.

## Further Steps

Of course, once you generalize a behavior, you could export it as a reusable library across various projects. I've been doing some experiments in that regard. The first is `redux-facet-alerts` (TODO: link there when it's public). Perhaps the pagination example in this README could also be turned into a generalized behavior.
