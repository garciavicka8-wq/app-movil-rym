import {initializeApp, getApps, getApp} from 'firebase/app';
import {getDatabase} from 'firebase/database';
import {getStorage} from 'firebase/storage';

const FIREBASE_CONFIG = __DEV__
  ? {
      apiKey: 'AIzaSyBYqt7kOGMvfKvSvhs-BxtsgYE0Egfn5ZI',
      authDomain: 'staging-sorteolabolita.firebaseapp.com',
      databaseURL: 'https://staging-sorteolabolita-default-rtdb.firebaseio.com',
      projectId: 'staging-sorteolabolita',
      storageBucket: 'staging-sorteolabolita.firebasestorage.app',
      messagingSenderId: '601406996203',
      appId: '1:601406996203:web:c994166dadf77ea5f208ae',
    }
  : {
      apiKey: 'AIzaSyCbL550sUkZz9WCJfsLS2ACnV8oog4NrRs',
      authDomain: 'sorteolabolita-75.firebaseapp.com',
      databaseURL: 'https://sorteolabolita-75.firebaseio.com',
      projectId: 'sorteolabolita-75',
      storageBucket: 'sorteolabolita-75.appspot.com',
      messagingSenderId: '221256415331',
    };

if (__DEV__) {
  console.log(`FIREBASE STAGING CONFIG ACTIVATED ${FIREBASE_CONFIG.projectId}`);
}

const FIREBASE_APP =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

const firebase = {
  db: getDatabase(FIREBASE_APP),
  storage: getStorage(FIREBASE_APP),
};

export default firebase;
