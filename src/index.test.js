import { act } from 'react-dom/test-utils';
import {
  StoreBuilder, mapActions, mapState, mapGetters, getDispatch,
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
  composedActionsTest: {
    itemType: null,
    items: [],
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
    case 'SET_ITEMS':
      return { ...state, composedActionsTest: payload };
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

it('should provide simple way to retrieve dispatch method from store', async () => {
  let store = null;
  mockStore(
    new StoreBuilder(initialState(), reducer).build(),
    (_store) => { store = _store; },
  );
  expect(store.state.isLoading).toBe(false);
  await act(async () => {
    const dispatch = getDispatch(store);
    await dispatch({ type: 'SET_LOADING', payload: true });
    const { isLoading } = mapState(store);
    expect(store.state.isLoading).toBe(true);
    expect(isLoading).toBe(true);
  });
});

it('should provide simple way to retrieve dispatch method from store submodules', async () => {
  let store = null;
  mockStore(
    new StoreBuilder(initialState(), reducer, 'submodulenamespace')
      .build(),
    (_store) => { store = _store; },
  );
  expect(store.submodulenamespace.state.isLoading).toBe(false);
  await act(async () => {
    const dispatch = getDispatch(store, 'submodulenamespace');
    await dispatch({ type: 'SET_LOADING', payload: true });
    expect(store.submodulenamespace.state.isLoading).toBe(true);
  });
});

it('should be able to dispatch an action by calling dispatchAction inside another action', async () => {
  let store = null;
  const scenario = { items: ['food1', 'food2'] };
  mockStore(
    new StoreBuilder(initialState(), reducer)
      .withActions(({ dispatch, dispatchAction }) => ({
        search: () => dispatchAction('getItemsByType', { itemType: 'food' }),
        getItemsByType: async ({ itemType }) => dispatch({ type: 'SET_ITEMS', payload: { ...scenario, itemType } }),
      }))
      .build(),
    (_store) => { store = _store; },
  );
  await act(async () => {
    const { search } = mapActions(store);
    await search();
    const { composedActionsTest } = mapState(store);
    expect(composedActionsTest).toStrictEqual({ ...scenario, itemType: 'food' });
  });
});
