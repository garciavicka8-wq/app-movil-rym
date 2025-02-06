import {DATABASE_TABLES} from '../../services/constants';
import Database from '../../database';

// ACTUALIZAR CREDITO
export const actualizarCredito = async (nuevoSaldo, creditoKey) => {
  try {
    await Database.update(DATABASE_TABLES.CREDITS, creditoKey, {
      saldo: nuevoSaldo <= 0 ? 0 : nuevoSaldo,
    });
  } catch ({message}) {
    throw new Error(message);
  }
};
