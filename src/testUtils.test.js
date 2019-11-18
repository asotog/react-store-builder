import { mockStore, storeMockBuilder } from './index';

describe('Test Utils tests :)', () => {
  const user = { firstName: 'Joe' };
  const getUser = jest.fn();
  const dispatch = jest.fn();
  const expectedStore = {
    user: {
      state: {
        detail: user,
      },
      getters: {
        currentUserFirstName: user.firstName,
      },
      actions: {
        getUser,
      },
      dispatch,
    },
  };

  it('should be able to mock stores', () => {
    let store = null;
    mockStore(
      () => ({ name: 'Joe Bloggs' }),
      (_store) => { store = _store; },
    );
    expect(store.name).toBe('Joe Bloggs');
  });

  it('should be able to mock store using a builder utility', () => {
    getUser.mockReturnValue(user);
    const store = storeMockBuilder()
      .mockState('user', { detail: user })
      .mockGetters('user', { currentUserFirstName: user.firstName })
      .mockActions('user', { getUser })
      .mockDispatch('user', dispatch)
      .build();
    expect(store).toStrictEqual(expectedStore);

    // actions
    const receivedUser = store.user.actions.getUser();
    expect(getUser).toHaveBeenCalled();
    expect(receivedUser).toBe(user);

    // dispatch
    store.user.dispatch({ type: 'PING' });
    expect(dispatch).toHaveBeenCalled();
  });

  it('should be able to mock store using a builder utility at root level', () => {
    const expectedRootStore = {
      state: {
        user,
      },
    };
    const store = storeMockBuilder()
      .mockState('', { user })
      .build();

    expect(store).toStrictEqual(expectedRootStore);
  });

  it('should be able to store multiple submodules', () => {
    const multipleStoreExpected = {
      ...expectedStore,
      auth: {
        state: {
          user,
        },
      },
    };
    getUser.mockReturnValue(user);
    const store = storeMockBuilder()
      .mockState('user', { detail: user })
      .mockGetters('user', { currentUserFirstName: user.firstName })
      .mockActions('user', { getUser })
      .mockDispatch('user', dispatch)
      .mockState('auth', { user })
      .build();
    expect(store).toStrictEqual(multipleStoreExpected);
  });
});
