import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Creates store that can be tested
 * @param {function} useStoreCallback Returns the store that will be created
 * @param {function} onRenderCallback Once store is ready, this callback
 * returns the store to the test
 */
export const mockStore = (useStoreCallback, onRenderCallback) => {
  let store;
  // create a mock component,
  // is the only way to use a hook from tests
  const ComponentMock = () => {
    store = useStoreCallback();
    onRenderCallback(store);
    return <div>mock</div>;
  };
  const node = document.createElement('div');
  ReactDOM.render(<ComponentMock />, node);
};

/**
 * Mocks a store, helps to reduce verbosity of react components tests that require store access
 * @param {Object} _store Optional not used directly
 */
export const storeMockBuilder = (_store = {}) => {
    let store = _store;
    const setMock = (moduleName, key, object) => {
      store = moduleName ? {
        ...store,
        [moduleName]: {
          ...store[moduleName],
          [key]: object,
        },
      } : {
        ...store,
        [key]: object,
      };
      return storeMockBuilder(store);
    };
    return {
      mockState: (moduleName, state) => setMock(moduleName, 'state', state),
      mockGetters: (moduleName, getters) => setMock(moduleName, 'getters', getters),
      mockActions: (moduleName, actions) => setMock(moduleName, 'actions', actions),
      mockDispatch: (moduleName, dispatch) => setMock(moduleName, 'dispatch', dispatch),
      build: () => store,
    };
  };
  