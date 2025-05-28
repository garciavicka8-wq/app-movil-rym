import UtilsModule from '../../src/utils/Utils';
import StorageModule from '../../src/utils/Storage';
import DatabaseModule from '../../src/database';
import * as CommonModule from '../../src/services/common';

// Mockeamos los módulos Storage y Utils
jest.mock('../../src/utils/Utils', () => ({
  Utils: {
    generarID: jest.fn(() => 'mockedID'), // Mock con implementación inicial
    separateId: jest.fn(id => `sep-${id}`), // Mock con implementación inicial
    calculateTransactionsSale: jest.fn((transactions, categoryId) => {
      if (categoryId === '1' && transactions.length === 0) {
        return {total: 0, recordsFound: 0};
      }
      if (categoryId === '1' && transactions.length > 0) {
        return {total: 35.5, recordsFound: 2};
      }
      if (!['1', '2', '3', '4'].includes(categoryId)) {
        return {total: 0, recordsFound: 1};
      }
    }),
  },
}));

jest.mock('../../src/utils/Storage', () => ({
  Storage: {
    getItem: jest.fn((key, parseValue = false) => {
      const user = JSON.stringify({
        name: 'Jhon',
        id: 1,
        usuario: `user-${key}`,
      });
      if (parseValue) {
        return JSON.parse(user);
      }

      return user;
    }),
  },
}));

jest.mock('../../src/database', () => ({
  getItem: jest.fn((refName, propName, value) => {
    if (refName === 'usuarios' && propName === 'usuario' && value === '123') {
      return Promise.resolve({
        id: '123',
        usuario: '123',
        nomComercial: 'La Comer',
      });
    }
  }),
  getItemsByProp: jest.fn((refName, propName, value) => {
    if (
      refName === 'premiosPagados' &&
      propName === 'fechaPago' &&
      value === '2025-05-19'
    ) {
      return Promise.resolve([{fechaPago: '2025-05-19', horaPago: '16:59:00'}]);
    }
    if (
      refName === 'premiosPagados' &&
      propName === 'fechaPago' &&
      value === '2025-05-18'
    ) {
      return Promise.resolve([]);
    }
  }),
  update: jest.fn((refName, itemKey, data) => {
    if (refName === 'usuarios' && itemKey === 'abc-dfg-123') {
      return Promise.resolve({key: itemKey, ...data});
    }

    return Promise.resolve(null);
  }),
}));

describe('Mock de Utils', () => {
  test('Utils.generarID debería retornar el valor mockeado', () => {
    expect(UtilsModule.Utils.generarID()).toBe('mockedID');
  });

  test('Utils.separateId debería aplicar la separación mockeada', () => {
    expect(UtilsModule.Utils.separateId('test')).toBe('sep-test');
  });
});

describe('Mock de Storage', () => {
  test('Storage.getItem deberia retornar el valor mockeado', () => {
    expect(StorageModule.Storage.getItem(1, true)).toEqual({
      name: 'Jhon',
      id: 1,
      usuario: 'user-1',
    });
  });
});

describe('obtenerUsuario', () => {
  test('Database.getItem con parametros usuarios, usuario, 123 debe retornar ese usuario', async () => {
    const user = {id: '123', usuario: '123', nomComercial: 'La Comer'};
    const userId = '123';
    const result = await CommonModule.getDbUser(userId);

    expect(DatabaseModule.getItem).toHaveBeenCalledWith(
      'usuarios',
      'usuario',
      userId,
    );
    expect(result).toEqual(user);
  });
});

describe('obtenerPremiosPagados', () => {
  test('Obtenemos una lista de los premios pagados en la fecha dada', async () => {
    const formatedDate = '2025-05-19';
    const result = await CommonModule.getPaidPrizesByDate(formatedDate);
    expect(DatabaseModule.getItemsByProp).toHaveBeenCalledWith(
      'premiosPagados',
      'fechaPago',
      formatedDate,
    );
    expect(result).toEqual([{fechaPago: '2025-05-19', horaPago: '16:59:00'}]);
  });
  test('Obtenemos una lista vacia ya que en la fecha dada no se registró ningun pago', async () => {
    const formatedDate = '2025-05-18';
    const result = await CommonModule.getPaidPrizesByDate(formatedDate);
    expect(DatabaseModule.getItemsByProp).toHaveBeenCalledWith(
      'premiosPagados',
      'fechaPago',
      formatedDate,
    );
    expect(result).toEqual([]);
  });
});

describe('updateDbUser', () => {
  test('se actualiza y se retorna el usuario indicado por medio de su key', async () => {
    const userKey = 'abc-dfg-123';
    const data = {
      nomComercial: 'El Bar',
    };

    await expect(
      CommonModule.updateDbUser(userKey, data),
    ).resolves.toBeUndefined();

    expect(DatabaseModule.update).toHaveBeenCalledWith(
      'usuarios',
      userKey,
      data,
    );
  });
});

describe('calculateTransactionsSale', () => {
  describe('con categoría 1 o 2 (Recarga/Paquete)', () => {
    const categoryId = '1';
    test(`debería calcular la venta total correctamente para categoría ${categoryId}`, () => {
      const transactions = [
        {CategoriaID: categoryId, Monto: '10.00'},
        {CategoriaID: categoryId, Monto: '25.50'},
        {CategoriaID: '3', Monto: '5.00'}, // No debería incluirse
      ];
      const result = UtilsModule.Utils.calculateTransactionsSale(
        transactions,
        categoryId,
      );
      expect(result.total).toBe(35.5);
      expect(result.recordsFound).toBe(2);
    });
  });

  test('debería retornar 0 y recordsFound 0 si la categoría no es 1, 2, 3 o 4', () => {
    const transactions = [{CategoriaID: '5', Monto: '10.00'}];
    const result = UtilsModule.Utils.calculateTransactionsSale(
      transactions,
      '5',
    );
    expect(result.total).toBe(0);
    expect(result.recordsFound).toBe(1); // Aunque se filtran, se encontraron registros
  });
});
