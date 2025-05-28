module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|react-native-config' +
      '|@react-navigation' +
      '|react-clone-referenced-element' +
      '|uuid' +
      '|firebase' +
      '|@firebase' +
      '|react-native-version-check' +
      ')/)',
  ],
  setupFiles: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
