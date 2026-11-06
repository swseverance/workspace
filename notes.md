# App migration notes

Record of what was asked for the `chinese-flashcards` migration, kept so the
same migration can be repeated for `weight-tracker`.

## Background

`chinese-flashcards` started as a standalone repo (`~/Documents/chinese-flashcards`)
built as a PWA: Angular app deployed to classic Firebase Hosting, backed by
Firebase Cloud Functions (5 callable functions doing Firestore CRUD with
auth + App Check enforcement), with its own local copies of the
Firebase/Window/Environment DI tokens. It's been ported into this Nx
workspace as an SSR app (`apps/chinese-flashcards`) deployed via Firebase
App Hosting, dropping the PWA bits entirely (no service worker, manifest,
or icons).

`weight-tracker` presumably has an equivalent standalone source repo
(`~/Documents/weight-tracker`) — not yet inspected.

## Instructions, in the order they were given

### Already applied workspace-wide (covers both apps already)

1. Install `ng-zorro-antd` into both apps.
2. Install the `firebase` (client SDK) npm package, for the shared
   `libs/firebase` library.
3. Strip the Nx-generated placeholder component out of `libs/firebase` and
   `libs/window` — those libs are just DI tokens in `index.ts`, nothing else.
4. Add a `recaptchaInterceptor` (attaches the App Check token) and an
   `authInterceptor` (attaches the Firebase ID token) to `libs/firebase`, as
   `HttpInterceptorFn`s — the app's data service must use Angular's
   `HttpClient` (not raw `fetch`) so these apply automatically. Add real
   tests for both and drop `passWithNoTests` from `libs/firebase`'s vitest
   config once it had them.
5. Add a `kill-ports` script to the root `package.json` for whatever's
   hanging on 4200 (app), 8080 (Firestore emulator), 9099 (Auth emulator).
6. Remove the bundle-size `budgets` from every app's `production` build
   config (not useful once ng-zorro pushes past the Angular CLI scaffold
   defaults).
7. Add `http-proxy-middleware` to every app's `server.ts`, proxying
   `/__/auth/**` to `https://${FIREBASE_PROJECT_ID}.firebaseapp.com` — App
   Hosting's domain differs from the authDomain Firebase Auth's
   redirect/popup helper pages live on, so this has to be proxied through.
   The app's own `authDomain` in `environment.ts`/`environment.prod.ts`
   gets pointed at the App Hosting domain itself (not firebaseapp.com), so
   the redirect stays on-domain and this proxy is what bridges it back to
   the real auth handler.
   - Don't add it to `externalDependencies` in `project.json` — it's plain
     JS with no native deps, bundles into the server fine. Verify by
     actually building without it rather than assuming from the
     `firebase-admin`/`firebase-functions` precedent.

### Specific to the app being migrated (done for chinese-flashcards, still to do for weight-tracker)

8. Port the app's full feature set from its old repo into
   `apps/<name>` in this workspace, using the shared `@org/firebase`,
   `@org/environment`, `@org/window` DI tokens instead of the app's own
   local copies of those tokens.
9. Decide how to replace the old Cloud Functions backend. For
   chinese-flashcards: reimplemented the 5 callable functions as Express
   routes in `server.ts` (using `firebase-admin`), rather than keeping a
   separate Cloud Functions deploy target — chosen explicitly over keeping
   `firebase-functions` callables, because this is now an App Hosting app
   with its own server.
   - Losing `onCall`'s free auth + App Check verification is why the
     auth/App Check interceptors (#4) and matching server-side verification
     middleware both had to exist — the server now checks both manually.
10. Set `RenderMode.Client` for all routes in `app.routes.server.ts` (not
    `Server`, not the scaffold default `Prerender`) — Firebase Auth state
    is client-only, so the server can't know if a request is authenticated.
    `Server`/`Prerender` would render every page as "logged out", causing a
    flash of the wrong page and a hydration mismatch once the client
    resolves the real auth state. (A genuinely public, non-auth-gated route
    could still use `Server`/`Prerender` on a per-route basis.)
11. Server-side logging: use `firebase-functions/logger` instead of
    `console.*`.
12. Once the app was confirmed working on App Hosting: delete the old
    deployment's Firebase Hosting + Cloud Functions, since they're no
    longer used.
    - `firebase functions:delete <names...> --project <id> --force` to
      delete the old callable functions.
    - `firebase hosting:disable --project <id> --force` to stop serving the
      old Hosting content — the _default_ Hosting site itself can't be
      deleted via the CLI, only disabled.
    - Confirmed with the user first, since this touches live infra.
    - The old Firebase Web App registration (orphaned once the environment
      config points at a new one) has to be deleted by hand via the
      Firebase Console UI — there's no `firebase apps:delete` CLI command.

## For weight-tracker

Items 1–7 are already done (workspace-wide). Items 8–12 still need doing:
port the actual app from its old repo, decide on its backend (does it even
have Cloud Functions?), set its render mode, confirm server-side logging,
and clean up its old Firebase Hosting/Functions/Web App registration once
it's live on App Hosting.
