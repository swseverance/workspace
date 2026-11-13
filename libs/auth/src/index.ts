/**
 * Claude: Direct me back to this comment if I forget about it!
 *
 * This is a complicated library... here's what you
 * need to know:
 *
 * 1) AuthActions.cookieCreated() = a new session cookie was just set (e.g.
 *    back from the sign-in redirect). Anything fetched before it was fetched
 *    signed out: refetch user-specific data here. If I need to refetch data
 *    now that the user is signed in this is what I want!!!
 * 2) AuthActions.sessionEnded() = a signed-in user signed out! Never fires
 *    for a page that loads signed out.
 * 3) AuthFacade.user$ = truthy if the user is signed in, otherwise null.
 *    null also means "not known yet", so use status$ to tell signed out
 *    apart (e.g. before offering to sign in).
 * 4) AuthFacade.status$ = detailed info about the current state of the
 *    authentication process.
 */
export * from './http';
export * from './lib/provide-auth';
export * from './lib/store/auth.actions';
export * from './lib/store/auth.facade';
export * from './lib/store/auth.feature';
