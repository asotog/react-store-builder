# React Store Builder
this library relies on react hooks to create scalable stores to share data through the application

### Contents
- [Quickstart](#quickstart)
- [Using dispatch to update state](#using-dispatch-to-update-state)

#### Pending documentation
- [Create action methods and use mapActions](#)
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

xport const initialState = () => ({
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
import { mapState } from 'react-store-builder';

const Home = (props) => {
  const store = useApplicationStoreContext();
  const { dispatch } = store;
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
