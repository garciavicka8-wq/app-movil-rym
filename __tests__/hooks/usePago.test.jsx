import React from 'react';
import {Text} from 'react-native';
import {render, waitFor} from '@testing-library/react-native';
import usePago from '../../src/screens/tickets/Pagos/hooks/usePago';
import {verifyTicket} from '../../src/screens/tickets/Pagos/services';

jest.mock('react-native-fs');
jest.mock('tp-react-native-bluetooth-printer');
// Mocks necesarios
jest.mock('../src/screens/tickets/Pagos/services', () => ({
  verifyTicket: jest.fn(),
  registrarPago: jest.fn(),
}));

jest.mock('../src/utils', () => ({
  Utils: {
    deleteCapturedImage: jest.fn(),
  },
  Money: jest.fn(val => `$${val}`),
  Storage: {
    getUser: jest.fn(() => ({usuario: 'testUser'})),
  },
  Print: {
    paymentTicket: jest.fn(),
  },
}));

jest.mock('../src/hooks', () => ({
  useThermalPrinter: () => ({print: jest.fn()}),
  useLogout: () => ({logout: jest.fn()}),
}));

// Mock dispatch
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

// Test wrapper
const TestComponent = ({modal}) => {
  const {comprobarBoleto} = usePago({modal});
  React.useEffect(() => {
    comprobarBoleto(
      {handleReset: jest.fn()},
      {primero: '123', segundo: '456', tercero: '789'},
      'fakeUri.jpg',
    );
  }, []);
  return <Text>Testing Hook</Text>;
};

describe('usePago', () => {
  const mockModal = {setConfig: jest.fn()};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra alerta si boleto no es ganador', async () => {
    verifyTicket.mockResolvedValueOnce({esGanador: false});

    render(<TestComponent modal={mockModal} />);

    await waitFor(() => {
      expect(verifyTicket).toHaveBeenCalledWith('123-456-789');
      expect(mockModal.setConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'mensaje',
        }),
      );
    });
  });

  test('muestra modal si el boleto es ganador', async () => {
    verifyTicket.mockResolvedValueOnce({
      esGanador: true,
      premio: 500,
    });

    render(<TestComponent modal={mockModal} />);

    await waitFor(() => {
      expect(mockModal.setConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          alertTitle: 'Boleto Ganador',
          contentType: 'pagar',
        }),
      );
    });
  });
});
