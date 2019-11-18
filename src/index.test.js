import { act } from 'react-dom/test-utils';
import {
  StoreBuilder, mapActions, mapState, mapGetters,
} from './index';
import { mockStore } from './testUtils';

const initialState = () => ({
  isLoading: false,
  error: null,
  successMessage: null,
  auth: {
    user: {
      id: '1',
    },
  },
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

it('should create store based on store and reducer', async () => {
  let store = null;
  mockStore(
    new StoreBuilder(initialState(), reducer).build(),
    (_store) => { store = _store; },
  );
  expect(store.state.isLoading).toBe(false);
  await act(async () => {
    await store.dispatch({ type: 'SET_LOADING', payload: true });
    const { isLoading } = mapState(store);
    expect(store.state.isLoading).toBe(true);
    expect(isLoading).toBe(true);
  });
});

it('should create getters for state deep values', async () => {
  let store = null;
  mockStore(
    new StoreBuilder(initialState(), reducer)
      .withGetters((state) => ({
        userId: state.auth.user.id,
      }))
      .build(),
    (_store) => { store = _store; },
  );
  const { userId } = mapGetters(store);
  expect(userId).toBe('1');
  expect(store.getters.userId).toBe('1');
});

it('should create actions that can modify state', async () => {
  let store = null;
  mockStore(
    new StoreBuilder(initialState(), reducer)
      .withActions(({ dispatch }) => ({
        setLoading: (isLoading) => dispatch({ type: 'SET_LOADING', payload: isLoading }),
      }))
      .build(),
    (_store) => { store = _store; },
  );
  await act(async () => {
    await store.actions.setLoading(true);
    expect(store.state.isLoading).toBe(true);
  });

  await act(async () => {
    const { setLoading } = mapActions(store);
    await setLoading(false);
    expect(store.state.isLoading).toBe(false);
  });
});

it('should create a namespaced store based on store and reducer', async () => {
  let store = null;
  mockStore(
    new StoreBuilder(initialState(), reducer, 'submodulenamespace')
      .withActions(({ dispatch }) => ({
        setLoading: (isLoading) => dispatch({ type: 'SET_LOADING', payload: isLoading }),
      }))
      .build(),
    (_store) => { store = _store; },
  );
  expect(store.submodulenamespace.state.isLoading).toBe(false);
  await act(async () => {
    await store.submodulenamespace.dispatch({ type: 'SET_LOADING', payload: true });
    expect(store.submodulenamespace.state.isLoading).toBe(true);
  });
  await act(async () => {
    const { setLoading } = mapActions(store, 'submodulenamespace');
    await setLoading(false);
    const { isLoading } = mapState(store, 'submodulenamespace');
    expect(store.submodulenamespace.state.isLoading).toBe(false);
    expect(isLoading).toBe(false);
  });
});

it('should be able of creating module with namespaced submodules', async () => {
  let store = null;
  const useSubmodule1 = new StoreBuilder(initialState(), reducer, 'submodulenamespace1').build();
  const useSubmodule2 = new StoreBuilder(initialState(), reducer, 'submodulenamespace2').build();
  mockStore(
    new StoreBuilder(initialState(), reducer)
      .withSubmodule(useSubmodule1)
      .withSubmodule(useSubmodule2)
      .build(),
    (_store) => { store = _store; },
  );
  expect(store.state.isLoading).toBe(false);
  expect(store.submodulenamespace1.state.isLoading).toBe(false);
  expect(store.submodulenamespace2.state.isLoading).toBe(false);
});
