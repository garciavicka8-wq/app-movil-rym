import {initializeApp, getApps, getApp} from 'firebase/app';
import {getDatabase} from 'firebase/database';
import {getStorage} from 'firebase/storage';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCbL550sUkZz9WCJfsLS2ACnV8oog4NrRs',
  authDomain: 'sorteolabolita-75.firebaseapp.com',
  databaseURL: 'https://sorteolabolita-75.firebaseio.com',
  projectId: 'sorteolabolita-75',
  storageBucket: 'sorteolabolita-75.appspot.com',
  messagingSenderId: '221256415331',
};

const FIREBASE_APP =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

const firebase = {
  db: getDatabase(FIREBASE_APP),
  storage: getStorage(FIREBASE_APP),
};

export default firebase;
