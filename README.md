# redux-facets

A pattern for tracking and channeling actions according to the container they were dispatched from.

As you build out a Redux application, you may find yourself repeating common patterns for various parts of your app. You may find yourself faced with a question of whether you can generalize those patterns into reusable pieces. You may find yourself behind the wheel of a large automobile. I digress...

The trouble with generalizing patterns in Redux, whether they be reducers, sagas or both, is that you will still need to create distinct actions for each container which utilizes the pattern, and your reducers still need to differentiate between those actions to know when to run. Consider:

## The Problem

You have a behavior for keeping track of pagination state which you want to replicate to various lists across your app. You create a reducer for handling pagination, `paginationReducer`, and actions for pagination events, `paginationActions`.

Now you supply those actions to your list containers, `UsersList` and `PostsList`, and you mount that reducer in the state for both collections, at `users.pagination` and `posts.pagination`.

```javascript
// UsersList/index.js
import { connect } from 'react-redux';
import View from './View';
import paginationActions from '../../actions/pagination';
// etc...

const mapStateToProps = (state) => ({ /* ... */ });

const mapDispatchToProps = (dispatch) => ({
  setPage: (page) => dispatch(paginationActions.setPage(page)),
  // ...
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
```

When you run the app and go to page 2 of Users, it goes to page 2 of Posts as well. Your actions have no way of indicating which list they came from, and even if they did, both of your reducers will trigger off any particular pagination action anyway.

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

That will work, though it's a bit clunky to use:

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

You might be able to streamline it a bit. But what's unavoidably emerging here is the complexity of having to tag and filter everything which used to be very straightforward. And we haven't even covered selectors yet, or sagas. Imagine if you had to write logic in all your sagas to make sure that the tag on an incoming action was replicated to all resulting actions!

So, we might give up and go back to duplicating reducer logic and actions across various parts of the app.

Or, we could try to capture all that complexity into a reusable framework. That's `redux-facets`.

## The Solution

A Facet is like a Container, but it intercepts all outgoing actions and provides a `meta` tag with the name of the Facet.

Let's look at the new code:

### Containers (now Facets)

A Facet is analogous to a Redux Container, but it modifies incoming and outgoing data to reflect the Facet. Ougoing actions are tagged automatically, and incoming state is sliced down to just the section the Facet controls (don't worry, you can still access unfiltered dispatching and global state if you need it).

```javascript
// facets/UsersList/index.js

import facet from 'redux-facets';
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

We don't need to make any modifications to our action creators. They'll be tagged automatically by the Facet.

### Reducers

Using Facets, it starts to make sense to make a distinction between typical one-off reducers, and reducers which maintain a portion of state that is repeatable across various parts of the tree (i.e., our pagination example).

For the latter, repeatable reducers, we don't need to make any changes, we just have to mount them in various other reducers across our app.

Now, we need to create the reducer that will handle the portion of the state tree for our Facet:

```javascript
import { createReducer } from 'redux-facets';
import { combineReducers } from 'redux-immutable';
import { NAME } from '../facets/UsersList';
// our 'common' pagination reducer
import pagination from './behaviors/pagination';

// the createReducer function filters incoming actions by facet name
export default createReducer(NAME, combineReducers({
  // simply mount our common reducer into our facet reducer
  pagination,
  // we can, of course, include other custom behaviors or whatever
  // else we want in this reducer.
  someCustomStuff: someOtherReducer,
}));
```

`createReducer` filters all incoming actions by the Facet name. That means your reducer function won't receive any actions that weren't dispatched from your Facet (or manually tagged as if they were).

That may seem limiting, but the limitation can also help organize your store and keep boundaries specific. If it's a problem, you can always skip `createReducer` and write your own reducer that checks for a Facet name only when you want it to. You can also selectively apply `createReducer` to sub-reducers, like so:

```javascript
export default combineReducers({
  // using createReducer here ensures our pagination is filtered to our facet only
  createReducer(NAME, pagination),
  // ... but these other reducers will still all get every single action that
  // redux dispatches.
  handlesGlobalActions: someOtherReducer,
});
```

### Selectors

We don't need to do anything special to the selectors, either. Since our `mapStateToProps` within our Facet will automatically select our Facet's portion of the state tree, we can write our selectors that will work in any Facet. If you need access to the global state in your selector, you can find it passed as the third parameter in `mapStateToProps`.

### Sagas

