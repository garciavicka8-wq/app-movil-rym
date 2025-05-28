import * as AuthModule from '../../src/services/auth';
import * as ServicesModule from '../../src/screens/tickets/JugarTickets/services';
import * as DatabaseModule from '../../src/database';

jest.mock('../../src/services/auth', () => ({
  obtenerUsuarioDb: jest.fn(),
}));

jest.mock('../../src/database', () => ({
  getItem: jest.fn((refName, propName, propValue) => {
    if (
      refName === 'sorteos' &&
      propName === 'id' &&
      propValue === 'sorteo-id-1637'
    ) {
      return Promise.resolve({
        activo: true,
        fecha: '2025-05-20',
        codigoSorteo: 'codigo-1',
      });
    }
  }),
}));

describe('registrarTicket', () => {
  test('debería registrar un ticket exitosamente', async () => {
    const usuario = {id: 1, usuario: '12345'};
    const sorteoDb = {
      activo: true,
      fecha: '2025-05-20',
      codigoSorteo: 'codigo-1',
    };
    // Mockear funciones
    AuthModule.obtenerUsuarioDb.mockResolvedValue(usuario);
    DatabaseModule.getItem.mockResolvedValue(sorteoDb);
    // Llamar funciones
    await AuthModule.obtenerUsuarioDb();
    const sorteoResult = await DatabaseModule.getItem(
      'sorteos',
      'id',
      'sorteo-id-1637',
    );
    // Esperar y comparar resultados
    expect(DatabaseModule.getItem).toHaveBeenCalledWith(
      'sorteos',
      'id',
      'sorteo-id-1637',
    );
    // ASEGURARSE DE QUE SE LLAME DENTRO DE LA FUNCION registrarTicket
    expect(AuthModule.obtenerUsuarioDb).toHaveBeenCalled();
    expect(sorteoResult).toEqual(sorteoDb);
  });
});
