import { isPlatformServer } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { ENVIRONMENT } from '@org/environment';
import { WINDOW } from '@org/window';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  AppCheck,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from 'firebase/firestore';

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
  }
}

export const FIREBASE_APP = new InjectionToken<FirebaseApp | null>(
  'FIREBASE_APP',
  {
    providedIn: 'root',
    factory: () => {
      if (isPlatformServer(inject(PLATFORM_ID))) {
        return null;
      }

      return initializeApp(inject(ENVIRONMENT).firebaseConfig);
    },
  },
);

export const AUTH = new InjectionToken<Auth | null>('AUTH', {
  providedIn: 'root',
  factory: () => {
    const app = inject(FIREBASE_APP);

    if (!app) {
      return null;
    }

    const auth = getAuth(app);

    if (inject(ENVIRONMENT).name === 'local') {
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true,
      });
    }

    return auth;
  },
});

export const FIRESTORE = new InjectionToken<Firestore | null>('FIRESTORE', {
  providedIn: 'root',
  factory: () => {
    const app = inject(FIREBASE_APP);

    if (!app) {
      return null;
    }

    const firestore = getFirestore(app);

    if (inject(ENVIRONMENT).name === 'local') {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }

    return firestore;
  },
});

export const FIREBASE_APP_CHECK = new InjectionToken<AppCheck | null>(
  'FIREBASE_APP_CHECK',
  {
    providedIn: 'root',
    factory: () => {
      const app = inject(FIREBASE_APP);

      if (!app) {
        return null;
      }

      const { name, reCAPTCHA } = inject(ENVIRONMENT);

      if (name === 'local') {
        // Browser-only: FIREBASE_APP is null on the server.
        inject(WINDOW)!.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      return initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(reCAPTCHA),
        isTokenAutoRefreshEnabled: true,
      });
    },
  },
);
