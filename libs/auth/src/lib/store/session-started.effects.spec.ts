import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { SessionUser } from '@org/server';
import { Subscription } from 'rxjs';
import { AuthActions } from './auth.actions';
import type { AuthState } from './auth.feature';
import { SessionStartedEffects } from './session-started.effects';

const ALICE: SessionUser = { uid: 'alice' };
const BOB: SessionUser = { uid: 'bob' };

const states = {
  unknown: { status: 'unknown', user: null },
  noSession: { status: 'noSession', user: null },
  signingIn: { status: 'signingIn', user: null },
  signedOut: { status: 'signedOut', user: null },
  signedIn: (user: SessionUser) => ({ status: 'signedIn', user }),
} satisfies Record<string, AuthState | ((user: SessionUser) => AuthState)>;

describe('SessionStartedEffects', () => {
  let store: MockStore;
  let dispatched: Action[];
  let subscription: Subscription;

  function start(initial: AuthState) {
    TestBed.configureTestingModule({
      providers: [
        SessionStartedEffects,
        provideMockStore({ initialState: { auth: initial } }),
      ],
    });

    store = TestBed.inject(MockStore);
    dispatched = [];
    subscription = TestBed.inject(
      SessionStartedEffects,
    ).sessionStarted$.subscribe((action) => dispatched.push(action));
  }

  function goTo(...sequence: AuthState[]) {
    for (const auth of sequence) {
      store.setState({ auth });
    }
  }

  afterEach(() => subscription.unsubscribe());

  // However the cookie came about: minted by this tab's request, or by
  // another tab's and only found valid by this one.
  it('fires when a page that loaded signed out becomes signed in', () => {
    start(states.unknown);

    goTo(states.noSession, states.signingIn, states.signedIn(ALICE));

    expect(dispatched).toEqual([AuthActions.sessionStarted({ user: ALICE })]);
  });

  it('fires when signing back in after signing out', () => {
    start(states.signedIn(ALICE));

    goTo(states.signedOut, states.signingIn, states.signedIn(ALICE));

    expect(dispatched).toEqual([AuthActions.sessionStarted({ user: ALICE })]);
  });

  it('fires once for the new user when the account changes', () => {
    start(states.signedIn(ALICE));

    goTo(states.signingIn, states.signedIn(BOB));

    expect(dispatched).toEqual([AuthActions.sessionStarted({ user: BOB })]);
  });

  it('fires if the user changes without passing through signing in', () => {
    start(states.signedIn(ALICE));

    goTo(states.signedIn(BOB));

    expect(dispatched).toEqual([AuthActions.sessionStarted({ user: BOB })]);
  });

  it('does not fire for a page that loads signed in', () => {
    start(states.unknown);

    goTo(states.signedIn(ALICE));

    expect(dispatched).toEqual([]);
  });

  it("does not fire when the same user's cookie is re-validated", () => {
    start(states.unknown);

    goTo(states.signedIn(ALICE), states.signedIn({ ...ALICE }));

    expect(dispatched).toEqual([]);
  });

  it('does not fire for a page that loads signed out', () => {
    start(states.unknown);

    goTo(states.noSession, states.signedOut);

    expect(dispatched).toEqual([]);
  });
});
