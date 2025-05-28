import {Utils} from '../../src/utils';

describe('getPreviousWeekPeriod', () => {
  test('debería retornar el periodo de la semana anterior correctamente cuando el inicio de la semana actual es un lunes', () => {
    const currentPeriod = {start: '2025-05-19', end: '2025-05-19'};
    const expectedPeriod = {start: '2025-05-12', end: '2025-05-18'};
    const result = Utils.getPreviousWeekPeriod(currentPeriod);
    expect(result.start).toBe(expectedPeriod.start);
    expect(result.end).toBe(expectedPeriod.end);
  });

  test('debería retornar el periodo de la semana anterior correctamente cuando el inicio de la semana actual es un domingo', () => {
    const currentPeriod = {start: '2025-05-12', end: '2025-05-12'};
    const expectedPeriod = {start: '2025-05-05', end: '2025-05-11'};
    const result = Utils.getPreviousWeekPeriod(currentPeriod);
    expect(result.start).toBe(expectedPeriod.start);
    expect(result.end).toBe(expectedPeriod.end);
  });
});
