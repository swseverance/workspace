import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { SessionUser } from '@org/server';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // The server's view of the session cookie (from GET /api/session).
    'Load Session': emptyProps(),
    'Session Loaded': props<{ user: SessionUser | null }>(),
    'Load Session Failed': props<{ error: unknown }>(),
    // Firebase's auth state; browser only.
    'Firebase User Changed': props<{ user: SessionUser | null }>(),

    'Open Sign In Modal': emptyProps(),
    'Close Sign In Modal': emptyProps(),

    // Email link (passwordless) sign-in. Firebase emails a link; opening it
    // signs in on the device that asked for it.
    'Send Sign In Link': props<{ email: string }>(),
    'Sign In Link Sent': props<{ email: string }>(),
    'Send Sign In Link Failed': props<{ error: unknown }>(),
    // Back from the emailed link: signing in with it failed (e.g. expired
    // or already used).
    'Email Link Sign In Failed': props<{ error: unknown }>(),

    'Sign In': props<{ provider: 'google' }>(),
    'Sign In Success': emptyProps(),
    'Sign In Failed': props<{ error: unknown }>(),

    'Sign Out': emptyProps(),
    'Sign Out Success': emptyProps(),
    'Sign Out Failed': props<{ error: unknown }>(),

    // A signed-in user stopped being signed in, for any reason: signed out
    // in this tab or another, or the account changed. Never dispatched for
    // a page that loads signed out. `user` is who was signed in. Unlike
    // Sign Out Success, which only reports a sign-out started in this tab.
    'Session Ended': props<{ user: SessionUser }>(),
    // The reverse: this tab became signed in as `user` after it loaded, in
    // this tab or another. Never dispatched for a page that loads signed in.
    // Unlike Cookie Created, which only reports that this tab's own request
    // made the server set a cookie.
    'Session Started': props<{ user: SessionUser }>(),

    // Keeping the httpOnly session cookie in step with Firebase's auth state.
    'Validate Cookie': props<{ user: SessionUser }>(),
    'Token Loaded': props<{ token: string; user: SessionUser }>(),
    'Load Token Failed': props<{ error: unknown }>(),
    'Cookie Created': props<{ user: SessionUser }>(),
    'Cookie Validated': props<{ user: SessionUser }>(),
    'Validate Cookie Failed': props<{ error: unknown }>(),
    'Clear Cookie': emptyProps(),
    'Cookie Cleared': emptyProps(),
    'Clear Cookie Failed': props<{ error: unknown }>(),
  },
});
