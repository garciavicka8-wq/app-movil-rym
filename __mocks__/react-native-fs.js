export default {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
  DocumentDirectoryPath: '/mocked/documents',
  ExternalDirectoryPath: '/mocked/external',
};
