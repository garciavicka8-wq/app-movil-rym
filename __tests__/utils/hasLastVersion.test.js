import semver from 'semver';
import {Utils} from '../../src/utils';

// Mockeamos la librería 'semver' completa
jest.mock('semver');

describe('hasLastVersion', () => {
  beforeEach(() => {
    // Limpiamos cualquier llamada anterior al mock antes de cada prueba
    jest.clearAllMocks();
  });

  test('debería retornar false si la versión del dispositivo es menor que la del servidor', () => {
    const deviceVersion = '1.0.0';
    const serverVersion = '1.1.0';
    semver.lt.mockReturnValue(true); // Simulamos que semver.lt('1.0.0', '1.1.0') devuelve true
    const result = Utils.hasLastVersion(deviceVersion, serverVersion);
    expect(result).toBe(false);
    expect(semver.lt).toHaveBeenCalledWith(deviceVersion, serverVersion);
  });

  test('debería retornar true si la versión del dispositivo es igual a la del servidor', () => {
    const deviceVersion = '1.0.0';
    const serverVersion = '1.0.0';
    semver.lt.mockReturnValue(false); // Simulamos que semver.lt('1.0.0', '1.0.0') devuelve false
    const result = Utils.hasLastVersion(deviceVersion, serverVersion);
    expect(result).toBe(true);
    expect(semver.lt).toHaveBeenCalledWith(deviceVersion, serverVersion);
  });

  test('debería retornar true si la versión del dispositivo es mayor que la del servidor', () => {
    const deviceVersion = '1.1.0';
    const serverVersion = '1.0.0';
    semver.lt.mockReturnValue(false); // Simulamos que semver.lt('1.1.0', '1.0.0') devuelve false
    const result = Utils.hasLastVersion(deviceVersion, serverVersion);
    expect(result).toBe(true);
    expect(semver.lt).toHaveBeenCalledWith(deviceVersion, serverVersion);
  });

  test('debería llamar a la función lt con los argumentos correctos', () => {
    const deviceVersion = '2.0.0';
    const serverVersion = '2.1.0';
    Utils.hasLastVersion(deviceVersion, serverVersion);
    expect(semver.lt).toHaveBeenCalledWith(deviceVersion, serverVersion);
  });
});
