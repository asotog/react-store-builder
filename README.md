# React Store Builder [![Build Status](https://travis-ci.org/asotog/react-store-builder.svg?branch=master)](https://travis-ci.org/asotog/react-store-builder) ![npm](https://img.shields.io/npm/v/react-store-builder)
this library relies on react hooks to create scalable stores to share data through the application

### Contents
- [Quickstart](#quickstart)
- [Using dispatch to update state](#using-dispatch-to-update-state)
- [Create action methods and use mapActions](#create-action-methods-and-use-mapactions)

#### Pending documentation
- [mapGetters for state access simplification](#)
- [Scalate with store submodules for large application](#)
- [Testing utils for store mockups](#)

### Installation
`npm install react-store-builder`

### Quickstart
Create the app store `applicationStore.js`

```
import React, { useContext } from 'react';
import { StoreBuilder } from 'react-store-builder';

export const initialState = () => ({
  isLoading: false,
  user: null,
  error: null,
  successMessage: null,
});

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_LOADING':
      return { ...state, isLoading: payload };
    case 'SET_ERROR':
      return { ...state, error: payload };
    case 'SET_SUCCESS':
      return { ...state, successMessage: payload };
    default:
      throw new Error();
  }
};

export const useApplicationStore = new StoreBuilder(initialState(), reducer)
  .build();

export const ApplicationStoreContext = React.createContext(initialState());

export const useApplicationStoreContext = () => useContext(ApplicationStoreContext);
```

Initialize from the app component

```
import { ApplicationStoreContext, useApplicationStore } from './applicationStore';
import { mapState } from 'react-store-builder';

function App() {
  const store = useApplicationStore();
  const { isLoading } = mapState(store);
  return (
    <ApplicationStoreContext.Provider value={store}>
      {/* routes, components, etc */}
    </ApplicationStoreContext.Provider>
  );
}
```

### Using dispatch to update state
Before using dispatch on any component different thant the app component first need to call the application store hook we created

```
import { useApplicationStoreContext } from './applicationStore';
import { mapState, getDispatch } from 'react-store-builder';

const Home = (props) => {
  const store = useApplicationStoreContext();
  const dispatch = getDispatch(store);
  const { user } = mapState(store);
  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      // retrieve user data, await, set user in the state etc
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    if (user) {
      load();
    }
  }, [user, dispatch]);
```

### Create action methods and use mapActions
Actions methods are useful when submitting a form or kind of action where interaction has an interaction, these actions can encapsulate dispatch calls but also api calls so you can wait data to be returned and reflect it into the state

#### Create actions
Can be created by using `withActions` (as argument is callback function containing the following object `{ dispatch, state, getters, rootStore, dispatchAction }`)  during the store setup:

```
import { todoAPI } from 'app/common/api/todo';
import { StoreBuilder } from 'react-store-builder';

export const initialState = () => ({
  list: [],
});

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'ADD_TODO': {
      const { todo } = payload;
      return { ...state, list: [ ...state.list, todo ] };
    }
    default:
      throw new Error();
  }
};

export const useTodosStore = new StoreBuilder(initialState(), reducer)
  .withActions(({ dispatch, rootStore }) => ({
    addTodo: async (payload) => {
      let todo;
      try {
        todo = await todoAPI.addTodo(payload);
        await dispatch({ type: 'ADD_TODO', payload: { todo } });
      } catch (e) {
        console.error(e); // or call an error dispatch here
      }
      return todo;
    },
  }))
  .build();
```

#### Using actions
Similar to `mapState` there is also a `mapActions`:

```
import { useApplicationStoreContext } from './applicationStore';
import { mapState } from 'react-store-builder';

const Todos = (props) => {
  const store = useApplicationStoreContext();
  const { addTodo } = mapActions(store);
  const { list } = mapState(store);
  return (
    <button onClick={() => addTodo({ title: `New Todo ${list.length}` })}>
  );
};
```

#### Composed actions
Also is possible to compose multiple actions for complex scenarios where store behaviour is split across multiple actions, so is possible to call an action, and from that action, call another by using `dispatchAction(actionName, payload)` method.

```
...

.withActions(({ dispatch, dispatchAction }) => ({
  search: (keywords) => dispatchAction('getItemsByType', { itemType: 'food' }),
  getItemsByType: async ({ itemType }) => dispatch({ type: 'SET_ITEMS', payload: { items: [ ... ], itemType } }),
}))

```