// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mocks comunes para React Native
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(() => 'mockApp'),
    getApp: jest.fn(() => 'mockApp'),
    getApps: jest.fn(() => []),
  };
});

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({app: {}})),
  ref: jest.fn(() => ({})),
  get: jest.fn(() => ({})),
  child: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
  orderByChild: jest.fn(() => ({})),
  equalTo: jest.fn(() => ({})),
  set: jest.fn(() => ({})),
  push: jest.fn(() => ({})),
  update: jest.fn(() => ({})),
  serverTimestamp: jest.fn(() => ({})),
  startAt: jest.fn(() => ({})),
  endAt: jest.fn(() => ({})),
  orderByKey: jest.fn(() => ({})),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
}));

jest.mock('react-native-device-info', () => ({
  getDeviceName: jest.fn(() => ({})),
  getSystemName: jest.fn(() => ({})),
  getSystemVersion: jest.fn(() => ({})),
}));

jest.mock('react-native-version-check');

jest.mock('react-native-bcrypt', () => ({
  compareSync: jest.fn(() => true),
  hashSync: jest.fn(() => 'hashed_password'),
  genSaltSync: jest.fn(() => 'salt'),
}));
