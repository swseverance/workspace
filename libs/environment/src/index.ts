import { InjectionToken } from '@angular/core';

export type EnvironmentName = 'prod' | 'dev' | 'local';

export const ENVIRONMENT = new InjectionToken<{
  name: EnvironmentName;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  reCAPTCHA: string;
}>('ENVIRONMENT');
