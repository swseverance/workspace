import { createFeature, createReducer, on } from '@ngrx/store';
import type { SessionUser } from '@org/server';
import { AuthActions } from './auth.actions';

export type AuthState = {
  user: SessionUser | null;
};

export const initialAuthState: AuthState = {
  user: null,
};

/** Registered under `auth`; provides `selectUser` among its selectors. */
export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    on(AuthActions.stateChanged, (state, { user }) => ({ ...state, user })),
  ),
});
