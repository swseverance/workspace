import { AuthActions } from './auth.actions';
import { authFeature, initialAuthState } from './auth.feature';

describe('authFeature', () => {
  it('stores the user from stateChanged', () => {
    const state = authFeature.reducer(
      initialAuthState,
      AuthActions.stateChanged({ user: { uid: 'u1' } }),
    );

    expect(authFeature.selectUser({ auth: state })).toEqual({ uid: 'u1' });
  });

  it('starts signed out', () => {
    expect(authFeature.selectUser({ auth: initialAuthState })).toBeNull();
  });
});
