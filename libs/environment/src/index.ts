import { InjectionToken } from '@angular/core';

export type EnvironmentName = 'prod' | 'dev' | 'local';

export type Environment = {
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
};

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');
