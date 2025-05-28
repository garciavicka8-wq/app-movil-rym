export const BluetoothEscposPrinter = {
  width58: 384, // valor simulado que puedas usar en tus tests
  width80: 576,
  printText: jest.fn(),
  setAlign: jest.fn(),
  printColumn: jest.fn(),
  // agrega cualquier otra función que uses
};

export const ALIGN = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2,
};
