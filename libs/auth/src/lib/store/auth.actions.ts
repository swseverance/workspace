import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { SessionUser } from '@org/server';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'State Changed': props<{ user: SessionUser | null }>(),

    'Open Sign In Modal': emptyProps(),
    'Close Sign In Modal': emptyProps(),
    'Sign In': props<{ provider: 'google' }>(),
    'Sign In Failed': props<{ error: unknown }>(),
    'Sign Out': emptyProps(),
    'Sign Out Succeeded': emptyProps(),
    'Sign Out Failed': props<{ error: unknown }>(),

    // Keeping the httpOnly session cookie in step with Firebase's auth state.
    'Validate Cookie': emptyProps(),
    'Token Loaded': props<{ token: string }>(),
    'Load Token Failed': props<{ error: unknown }>(),
    'Cookie Created': emptyProps(),
    'Cookie Validated': emptyProps(),
    'Validate Cookie Failed': props<{ error: unknown }>(),
    'Clear Cookie': emptyProps(),
    'Cookie Cleared': emptyProps(),
    'Clear Cookie Failed': props<{ error: unknown }>(),
  },
});
