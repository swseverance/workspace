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

    'Sign In': props<{ provider: 'google' }>(),
    'Sign In Success': emptyProps(),
    'Sign In Failed': props<{ error: unknown }>(),

    'Sign Out': emptyProps(),
    'Sign Out Success': emptyProps(),
    'Sign Out Failed': props<{ error: unknown }>(),

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
