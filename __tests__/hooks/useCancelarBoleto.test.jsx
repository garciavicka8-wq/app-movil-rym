import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import useCancelarBoleto from '../../src/screens/tickets/Cancelados/hooks/useCancelarBoleto';
import {useDispatch} from 'react-redux';
import {Text} from 'react-native';
import {Print} from '../../src/utils';
import {cancelTicket} from '../../src/screens/tickets/Cancelados/services';

// Mocks
jest.mock('../src/hooks/', () => ({
  __esModule: true,
  useThermalPrinter: () => ({
    isPrintingPossible: jest.fn(() => Promise.resolve(true)),
    print: jest.fn(fn => fn()),
    isPrinting: jest.fn(fn => fn()),
  }),
  useLogout: () => ({
    logout: jest.fn(),
  }),
}));

jest.mock('../src/utils/Print', () => ({
  canceledTicket: jest.fn(),
}));
jest.mock('../src/screens/tickets/Cancelados/services', () => ({
  cancelTicket: jest.fn(),
}));
jest.mock('uuid', () => ({
  uuid: jest.fn(() => 'unique-id'),
}));
jest.mock('../src/utils/Money', () => jest.fn(val => `$${val}`));

// Mock dispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Componente de prueba
const TestComponent = ({modal, formik, data, uri}) => {
  const {handleCancelar} = useCancelarBoleto({modal});

  React.useEffect(() => {
    // Ejecutar cancelación asincrónica
    (async () => {
      await handleCancelar(formik, data, uri);
    })();
  }, []);

  return <Text>Test</Text>;
};

describe('useCancelarBoleto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllTimers(); // si usas timers
    jest.clearAllMocks(); // resetea mocks
    jest.resetModules(); // opcional: evita cache de módulos
  });
  it('cancela el boleto correctamente y muestra modal', async () => {
    const dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);

    const modal = {
      setConfig: jest.fn(),
    };
    const formik = {
      handleReset: jest.fn(),
    };
    const data = {primero: '123', segundo: '456', tercero: '789'};
    const uri = 'test-image.jpg';
    const boletoMock = {
      reembolso: 50,
      fechaCancelacion: '2024-01-01',
      horaCancelacion: '10:00',
      numeroBoleto: '123-456-789',
    };
    const saldoMock = 500;

    cancelTicket.mockResolvedValue({
      boleto_cancelado: boletoMock,
      saldo_nuevo: saldoMock,
    });

    render(
      <TestComponent modal={modal} formik={formik} data={data} uri={uri} />,
    );

    // Espera a que todas las acciones asincrónicas ocurran
    await waitFor(() => {
      expect(cancelTicket).toHaveBeenCalledWith('123-456-789', uri);
      expect(Print.canceledTicket).toHaveBeenCalledWith(boletoMock);
      expect(dispatchMock).toHaveBeenCalled();
      expect(formik.handleReset).toHaveBeenCalled();
      expect(modal.setConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          alertTitle: 'Boleto cancelado',
        }),
      );
    });
  });

  it('muestra error si la API rechaza la cancelación por tiempo excedido', async () => {
    const dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);

    const modal = {
      setConfig: jest.fn(),
    };

    const formik = {
      handleReset: jest.fn(),
    };

    const data = {
      primero: '123',
      segundo: '456',
      tercero: '789',
    };

    const uri = 'test-image.jpg';

    // 🟥 Simulamos error de tiempo excedido
    cancelTicket.mockRejectedValue(
      new Error(
        'No se puede cancelar este boleto. Han pasado más de 60 minutos.',
      ),
    );

    render(
      <TestComponent modal={modal} formik={formik} data={data} uri={uri} />,
    );

    await waitFor(() => {
      expect(cancelTicket).toHaveBeenCalledWith('123-456-789', uri);

      // No se debe imprimir, ni resetear, ni hacer dispatch
      expect(Print.canceledTicket).not.toHaveBeenCalled();
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(formik.handleReset).toHaveBeenCalled(); // ✅ porque en el catch sí se llama

      // El modal debe mostrar error
      expect(modal.setConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
        }),
      );
    });
  });
});
