# react-store-builder
this library relies on react hooks to create scalable stores to share data through the application

### Quickstart
Create the app store `applicationStore.js`

```
import React, { useContext } from 'react';
import { StoreBuilder } from 'react-store-builder';

xport const initialState = () => ({
  isLoading: false,
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
