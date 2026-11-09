import { AuthActions } from './auth.actions';
import { AuthState, authFeature, initialAuthState } from './auth.feature';

const u1 = { uid: 'u1' };
const reduce = (
  state: AuthState,
  ...actions: Parameters<typeof authFeature.reducer>[1][]
) => actions.reduce(authFeature.reducer, state);

describe('authFeature', () => {
  it('starts unknown', () => {
    expect(initialAuthState).toEqual({ status: 'unknown', user: null });
  });

  it('is noSession when the session call fails', () => {
    expect(
      reduce(
        initialAuthState,
        AuthActions.loadSessionFailed({ error: new Error('x') }),
      ),
    ).toEqual({ status: 'noSession', user: null });
  });

  it('is signed in when the server has a session', () => {
    expect(
      reduce(initialAuthState, AuthActions.sessionLoaded({ user: u1 })),
    ).toEqual({ status: 'signedIn', user: u1 });
  });

  it('is noSession, not signedOut, when the server has none', () => {
    expect(
      reduce(initialAuthState, AuthActions.sessionLoaded({ user: null })),
    ).toEqual({ status: 'noSession', user: null });
  });

  it('is signing in while the cookie for a Firebase user is created', () => {
    const state = reduce(
      initialAuthState,
      AuthActions.sessionLoaded({ user: null }),
      AuthActions.firebaseUserChanged({ user: u1 }),
    );
    expect(state).toEqual({ status: 'signingIn', user: null });

    expect(reduce(state, AuthActions.cookieCreated({ user: u1 }))).toEqual({
      status: 'signedIn',
      user: u1,
    });
  });

  it('stays signed in when Firebase confirms the same user', () => {
    const state: AuthState = { status: 'signedIn', user: u1 };

    expect(reduce(state, AuthActions.firebaseUserChanged({ user: u1 }))).toBe(
      state,
    );
  });

  it('signs in again when Firebase has a different user', () => {
    expect(
      reduce(
        { status: 'signedIn', user: u1 },
        AuthActions.firebaseUserChanged({ user: { uid: 'u2' } }),
      ),
    ).toEqual({ status: 'signingIn', user: null });
  });

  it('is signed out when Firebase has no user', () => {
    expect(
      reduce(
        { status: 'signedIn', user: u1 },
        AuthActions.firebaseUserChanged({ user: null }),
      ),
    ).toEqual({ status: 'signedOut', user: null });
  });

  it.each([
    AuthActions.loadTokenFailed({ error: new Error('x') }),
    AuthActions.validateCookieFailed({ error: new Error('x') }),
  ])('is signed out when the cookie cannot be created (%o)', (action) => {
    expect(reduce({ status: 'signingIn', user: null }, action)).toEqual({
      status: 'signedOut',
      user: null,
    });
  });

  it.each([
    AuthActions.loadTokenFailed({ error: new Error('x') }),
    AuthActions.validateCookieFailed({ error: new Error('x') }),
  ])('stays signed in when re-validating fails (%o)', (action) => {
    const signedIn: AuthState = { status: 'signedIn', user: u1 };

    expect(reduce(signedIn, action)).toBe(signedIn);
  });
});
