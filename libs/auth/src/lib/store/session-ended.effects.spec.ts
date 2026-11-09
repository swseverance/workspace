import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { SessionUser } from '@org/server';
import { Subscription } from 'rxjs';
import { AuthActions } from './auth.actions';
import type { AuthState } from './auth.feature';
import { SessionEndedEffects } from './session-ended.effects';

const ALICE: SessionUser = { uid: 'alice' };
const BOB: SessionUser = { uid: 'bob' };

const states = {
  unknown: { status: 'unknown', user: null },
  noSession: { status: 'noSession', user: null },
  signingIn: { status: 'signingIn', user: null },
  signedOut: { status: 'signedOut', user: null },
  signedIn: (user: SessionUser) => ({ status: 'signedIn', user }),
} satisfies Record<string, AuthState | ((user: SessionUser) => AuthState)>;

describe('SessionEndedEffects', () => {
  let store: MockStore;
  let dispatched: Action[];
  let subscription: Subscription;

  function start(initial: AuthState) {
    TestBed.configureTestingModule({
      providers: [
        SessionEndedEffects,
        provideMockStore({ initialState: { auth: initial } }),
      ],
    });

    store = TestBed.inject(MockStore);
    dispatched = [];
    subscription = TestBed.inject(SessionEndedEffects).sessionEnded$.subscribe(
      (action) => dispatched.push(action),
    );
  }

  function goTo(...sequence: AuthState[]) {
    for (const auth of sequence) {
      store.setState({ auth });
    }
  }

  afterEach(() => subscription.unsubscribe());

  it('fires when the signed-in user signs out', () => {
    start(states.signedIn(ALICE));

    goTo(states.signedOut);

    expect(dispatched).toEqual([AuthActions.sessionEnded({ user: ALICE })]);
  });

  it('fires once for the old user when the account changes', () => {
    start(states.signedIn(ALICE));

    goTo(states.signingIn, states.signedIn(BOB));

    expect(dispatched).toEqual([AuthActions.sessionEnded({ user: ALICE })]);
  });

  it('fires if the user changes without passing through signed out', () => {
    start(states.signedIn(ALICE));

    goTo(states.signedIn(BOB));

    expect(dispatched).toEqual([AuthActions.sessionEnded({ user: ALICE })]);
  });

  it('does not fire for a page that loads signed out', () => {
    start(states.unknown);

    goTo(states.noSession, states.signedOut);

    expect(dispatched).toEqual([]);
  });

  it('does not fire for a page that loads signed in', () => {
    start(states.unknown);

    goTo(states.signedIn(ALICE), states.signedIn(ALICE));

    expect(dispatched).toEqual([]);
  });

  it('does not fire when signing in', () => {
    start(states.noSession);

    goTo(states.signingIn, states.signedIn(ALICE));

    expect(dispatched).toEqual([]);
  });
});
