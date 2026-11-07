import { Environment } from '@org/environment';

export const environment = {
  name: 'prod',
  firebaseConfig: {
    apiKey: 'AIzaSyD5ufzwDAEktLVKjhS_BYdk4xQ7Uwf3Mt4',
    authDomain: 'tcpl-exercises--tcpl-exercises-prod.us-east4.hosted.app',
    projectId: 'tcpl-exercises-prod',
    storageBucket: 'tcpl-exercises-prod.firebasestorage.app',
    messagingSenderId: '153344388097',
    appId: '1:153344388097:web:7b5f929729b358cd392400',
    measurementId: 'G-K5TM1C8VTD',
  },
  reCAPTCHA: '6Le5GAouAAAAAMD8-2SLNSHVQ3ySA1hzPl1_8Ge8',
} satisfies Environment;
