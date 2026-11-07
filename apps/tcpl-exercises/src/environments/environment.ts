import { Environment } from '@org/environment';

export const environment = {
  name: 'local',
  firebaseConfig: {
    apiKey: 'AIzaSyBI6tx8HJQtkToKHb97qQRNAs1bpoUEh8Y',
    authDomain: 'tcpl-exercises-dev.firebaseapp.com',
    projectId: 'tcpl-exercises-dev',
    storageBucket: 'tcpl-exercises-dev.firebasestorage.app',
    messagingSenderId: '452141031571',
    appId: '1:452141031571:web:ed7fb310cdb932f9c42d66',
    measurementId: 'G-QEJCJEVPSX',
  },
  reCAPTCHA: '6Le2GAouAAAAAI8kpxiwpNFVtEFXLHhQaS-y56TZ',
} satisfies Environment;
