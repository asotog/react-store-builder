import { useReducer, useCallback } from 'react';
import * as testUtils from './testUtils';

const postBuild = (store) => {
  if (window) {
    window.$store = store;
  }
  return store;
};

// eslint-disable-next-line import/prefer-default-export
export class StoreBuilder {
  constructor(state, reducer, namespace) {
    this.state = state;
    this.reducer = reducer;
    this.actions = () => ({});
    this.getters = () => ({});
    this.namespace = namespace;
    this.submodules = [];
  }

  withActions(actions) {
    this.actions = actions;
    return this;
  }

  withGetters(getters) {
    this.getters = getters;
    return this;
  }

  withSubmodule(module) {
    this.submodules.push(module);
    return this;
  }

  build() {
    return (initialState, rootStore) => {
      const [state, dispatch] = useReducer(this.reducer, initialState || this.state);
      const getters = this.getters(state);

      const store = {
        state,
        dispatch,
        actions: {},
        dispatchAction: null,
        getters,
      };

      const dispatchAction = (actionName, payload) => store.actions()[actionName](payload);

      store.dispatchAction = dispatchAction;

      store.actions = useCallback(() => this.actions({
        dispatch, state, getters, rootStore, dispatchAction,
      }));
      const namespacedStore = this.namespace ? {
        [this.namespace]: store,
      } : store;

      const submodules = this.submodules
        .map((mod) => mod(null, store)) // call hook
        .reduce((prev, curr) => ({ ...prev, ...curr }), {}); // transform to a map of modules

      return postBuild({
        ...namespacedStore,
        ...submodules,
      });
    };
  }
}

export const mapActions = (store, namespace) => {
  if (namespace) {
    return store[namespace].actions();
  }
  return store.actions();
};

export const mapState = (store, namespace) => {
  if (namespace) {
    return store[namespace].state;
  }
  return store.state;
};

export const mapGetters = (store, namespace) => {
  if (namespace) {
    return store[namespace].getters;
  }
  return store.getters;
};

export const getDispatch = (store, namespace) => {
  if (namespace) {
    return store[namespace].dispatch;
  }
  return store.dispatch;
};

export const { mockStore, storeMockBuilder } = testUtils;
