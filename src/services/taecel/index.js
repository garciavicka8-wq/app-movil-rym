import Decimal from 'decimal.js';
import {Helpers, Moment, Money, Storage, uuid} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import Database from '../../database';
import {DATABASE_TABLES, TRANSACTION_STRUCTURE} from '../constants';
import {actualizarCredito} from '../credito';
import {getPeriodFromMonday, getServerTimestamp} from '../common';
import {TRANSACTION_STATES, TXN} from '../../constants';
import {logError} from '../logger';
import {requestRymAPI, requestTaecelAPI} from '../http';
const bcrypt = require('react-native-bcrypt');
const TXN_STATUS_SUCCESS = 'SUCCESS';

// GET TAECEL PRODUCTS
export const getProducts = async () => {
  try {
    const response = await requestRymAPI('taecel/productos');
    return response;
  } catch (error) {
    logError('getProducts', error.message);
    throw Error('Error al obtener productos');
  }
};
// MAKE TRANSACTION
export const makeTransaction = async (
  categoriaID,
  code,
  reference,
  total,
  descripcionProducto,
  transactionType = 'makeRecharge', // 'makeRecharge' | 'payService'
) => {
  try {
    const usuarioDB = await obtenerUsuarioDb();
    const tempId = uuid();
    const isRecharge = transactionType === 'makeRecharge';

    // Verificar saldo suficiente
    if (!(await checkBalance(total, isRecharge ? 'airtime' : 'service'))) {
      throw new Error('No cuentas con saldo suficiente');
    }

    // Realizar transacción
    const transID = await makeRequest(
      code,
      reference,
      isRecharge ? null : total,
    );
    if (!transID || transID === 'empty') {
      throw new Error(`Transacción fallida, ${transID}`);
    }

    // Construcción de datos de transacción
    const transactionData = {
      transID,
      tempId,
      usuario: usuarioDB.usuario,
      referencia: reference,
      monto: total,
      categoriaID,
      descripcionProducto,
      ...(isRecharge && {
        comisionRecargas: usuarioDB.comisionRecargas,
        comisionRecargasFecha: usuarioDB.comisionRecargasFecha,
      }),
    };

    // Guardar transacción
    await saveTransaction(transactionData);

    // Intentar obtener el estado de la transacción por hasta 60 segundos
    const startTime = Date.now();
    let data;
    do {
      data = await getStatusRequest(transID);
      if (data.status !== TRANSACTION_STATES.PROCESSING) break;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } while ((Date.now() - startTime) / 1000 < 60);

    // Manejar transacción fallida
    if (transactionFailed(data.status)) {
      await updateTransaction({
        ...transactionData,
        transaccion: data.transaccion,
      });
      throw new Error(data.transaccion?.Nota || 'Error en la transacción');
    }

    // Actualizar y retornar transacción exitosa
    data.status = data.status === TXN_STATUS_SUCCESS ? 'success' : data.status;
    await updateTransaction({
      ...transactionData,
      transaccion: data.transaccion,
    });

    return data;
  } catch (error) {
    console.error(`[Error]: ${error.message} | [Func]: makeTransaction`);
    throw new Error(error.message);
  }
};
// MAKE TRANSACTION API RYM
export async function makeTransactionAPI(
  categoriaID,
  code,
  reference,
  total,
  descripcionProducto,
  transactionType = 'makeRecharge', // 'makeRecharge' | 'payService'
) {
  try {
    const userStorage = Storage.getUser();
    const res = await requestRymAPI('taecel/hacerTransaccion', {
      categoria_id: categoriaID,
      code,
      reference,
      total,
      descripcion_producto: descripcionProducto,
      transaction_type: transactionType,
      numero_usuario: userStorage.usuario,
    });

    if (res.error) {
      throw new Error(res.error_message);
    }

    return res.data;
  } catch (error) {
    // console.error(`[Error]: ${error.message} | [Func]: makeTransactionAPI`);
    throw new Error(error.message);
  }
}
// CHECK BALANCE
export const checkBalance = async (total, type) => {
  try {
    const taecelResponse = await getBalance();

    if (!taecelResponse?.success || !Array.isArray(taecelResponse.data)) {
      throw new Error('No se pudo obtener el saldo.');
    }

    // Determinar índice según el tipo
    const index = type === 'airtime' ? 0 : type === 'service' ? 1 : -1;
    if (index === -1 || !taecelResponse.data[index]?.Saldo) {
      throw new Error(`Tipo de saldo inválido: ${type}`);
    }

    // Obtener y limpiar el saldo
    const balanceStr = taecelResponse.data[index].Saldo.replace(/[ ,]/g, '');
    const balance = new Decimal(parseFloat(balanceStr));

    return balance.greaterThanOrEqualTo(total);
  } catch (error) {
    console.error(`[Error]: ${error.message} | [Func]: checkBalance`);
    throw new Error('Error al obtener el saldo');
  }
};
// GET BALANCE
export const getBalance = async () => {
  try {
    const taecelResponse = await requestTaecelAPI('getBalance');
    return taecelResponse;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: getBalance');
    throw Error('Error al obtener el balance');
  }
};
// MAKE REQUEST
export const makeRequest = async (code, reference, amount = null) => {
  try {
    // Determinar si se necesita el monto (para servicios) o no (para recargas/giftcards)
    const params =
      amount !== null
        ? [code, reference, parseFloat(amount)]
        : [code, reference];

    const response = await requestTXN(...params);

    if (!response?.success) {
      throw new Error(response?.message ?? 'Error desconocido');
    }

    return response.data?.transID ?? 'empty';
  } catch (error) {
    console.error(`[Error]: ${error.message} | [Func]: makeRequest`);
    throw new Error(`Error al procesar la transacción: ${error.message}`);
  }
};
// REQUEST TXN
export const requestTXN = async (product, reference, amount) => {
  try {
    // HACEMOS LA PETICION
    const taecelResponse = await requestTaecelAPI('RequestTXN', {
      producto: product,
      referencia: reference,
      // SOLO SI EXISTE EL PARAMETRO AMOUNT
      ...(amount ? {monto: amount} : {}),
    });
    return taecelResponse;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: requestTXN');
    throw Error('Error al hacer la petición, ' + message);
  }
};
// SAVE TEMPORARY TXN
async function saveTransaction({
  transID,
  tempId,
  usuario,
  referencia,
  monto,
  categoriaID,
  descripcionProducto,
  comisionRecargas = 2,
  comisionRecargasFecha = '',
}) {
  try {
    // Obtener la fecha del servidor
    const timestamp = await Database.getServerDate();
    if (!timestamp) throw new Error('No se pudo obtener la fecha del servidor');
    const formatDate = format => Moment(timestamp).format(format);
    const isRecarga = [TXN.CODES.RECARGA, TXN.CODES.PAQUETE].includes(
      categoriaID,
    );

    // Definir comisiones y ajustes según categoría
    const abono =
      categoriaID === TXN.CODES.GIFTCARD ? parseFloat(monto) * 0.02 : 0;
    const cargo = categoriaID === TXN.CODES.SERVICIO ? 5 : 0;
    const comision = isRecarga
      ? comisionRecargas
      : categoriaID === TXN.CODES.SERVICIO
      ? 7
      : 0;
    // Guardar transacción en la base de datos
    await Database.save(DATABASE_TABLES.TRANSACTIONS, {
      ...TRANSACTION_STRUCTURE,
      TransID: transID,
      CategoriaID: categoriaID,
      Abono: Money(abono),
      Cargo: Money(cargo),
      Comision: Money(comision),
      Telefono: referencia,
      Monto: Money(monto),
      tempId,
      _comisionRecargas: Money(isRecarga ? comision : 0),
      _comisionRecargasFecha: isRecarga ? comisionRecargasFecha : '',
      _usuario: usuario,
      _fecha: formatDate('YYYY-MM-DD'),
      _hora: formatDate('HH:mm:ss'),
      descripcionProducto,
    });
  } catch (error) {
    console.error('[saveTransaction] Error:', error.message);
    throw new Error('Error en saveTransaction: ' + error.message);
  }
}
/**
 * @typedef {Object} TransactionStatusResponse
 * @property {'SUCCESS' | 'PROCESSING' | 'FAILED'} status - Estado de la transacción.
 * @property {Object | null} transaccion - Datos de la transacción si están disponibles.
 */
/**
 * Obtiene el estado de una transacción basada en su transID.
 * @param {string} transID - ID de la transacción a consultar.
 * @returns {Promise<TransactionStatusResponse>} Objeto con el estado y detalles de la transacción.
 */
export const getStatusRequest = async transID => {
  try {
    const taecelResponse = await statusTXN(transID);

    const {Status} = taecelResponse.data;

    // Evaluar estado con un switch para mayor claridad
    const status = (() => {
      switch (Status) {
        case 'Exitosa':
          return 'SUCCESS';
        case '':
          return 'PROCESSING';
        case 'Fracasada':
        case undefined:
          return 'FAILED';
        default:
          return 'FAILED';
      }
    })();

    return {status, transaccion: taecelResponse.data ?? null};
  } catch (error) {
    const errorMessage =
      error?.message ?? 'Error desconocido en la transacción';
    logError('getStatusRequest', errorMessage);
    throw new Error(errorMessage);
  }
};
// TXN STATUS
export const statusTXN = async transID => {
  try {
    const taecelResponse = await requestTaecelAPI('StatusTXN', {transID});
    return taecelResponse;
  } catch (error) {
    console.log('[Error]: ' + message, '[Func]: statusTXN');
    throw Error('Error al solicitar el status');
  }
};
// UPDATE TEMPORARY TXN
async function updateTransaction({
  tempId,
  transaccion,
  categoriaID,
  descripcionProducto,
  usuario,
  comisionRecargas = 2,
  comisionRecargasFecha = '',
}) {
  try {
    // RECUPERAMOS TRANSACCION PREVIA
    const prevTransaccion = await Database.getItem(
      DATABASE_TABLES.TRANSACTIONS,
      'tempId',
      tempId,
    );
    // SI EXISTE LA TRANSACCION PREVIA
    if (prevTransaccion) {
      const formatDate = format => Moment(transaccion.Fecha).format(format);
      const isRecarga = [TXN.CODES.RECARGA, TXN.CODES.PAQUETE].includes(
        categoriaID,
      );

      let newTransaccion = {
        ...transaccion,
        CategoriaID: categoriaID,
        _usuario: usuario,
        _fecha: formatDate('YYYY-MM-DD'),
        _hora: formatDate('HH:mm:ss'),
        descripcionProducto,
        // SE APLICA SOLO PARA RECARGAS
        _comisionRecargas: isRecarga ? Money(comisionRecargas) : Money(0),
        _comisionRecargasFecha: isRecarga ? comisionRecargasFecha : '',
      };
      // SI ES UNA RECARGA
      await Database.save(
        DATABASE_TABLES.TRANSACTIONS,
        newTransaccion,
        prevTransaccion.key,
      );
    }
    // ACTUALIZAMOS EL CREDITO SI LA TRANSACCION FUE EXITOSA
    if (transaccion.Status === TXN.STATES.SUCCESS) {
      const credito = await Database.getItem(
        DATABASE_TABLES.CREDITS,
        'usuario',
        usuario,
      );
      // VERIFICAMOS SI EXISTE EL CREDITO
      if (credito) {
        // RESTAMOS EL MONTO DE LA TRANSACCION AL CREDITO DISPONIBLE
        const montoTransaccion = Helpers.calcularTotalTransaccion(
          transaccion,
          categoriaID,
        );
        const saldoNuevo = credito.saldo - montoTransaccion;
        await actualizarCredito(saldoNuevo, credito.key);
      }
    }
  } catch (error) {
    console.log('[Error]: ' + error.message, '[Func]: updateTransaction');
    throw new Error(error.message);
  }
}
// GET TRANSACIONS
export const getTransactions = async periodo => {
  try {
    // OBTENER TRANSACCIONES
    const usuarioDB = await obtenerUsuarioDb();
    let transaccionesObj = await Database.getFullObjectInRange(
      DATABASE_TABLES.TRANSACTIONS,
      '_fecha',
      periodo.inicial,
      periodo.final,
      item => item._usuario === usuarioDB.usuario,
    );
    return transaccionesObj.list;
  } catch ({message}) {
    throw new Error(message);
  }
};
// SAVE RECHAGE COMISSION
export async function saveRechargeCommission(comision, password, callback) {
  try {
    const userStorage = Storage.getUser();
    const userDB = await Database.getItem(
      DATABASE_TABLES.USERS,
      'usuario',
      userStorage.usuario,
    );
    bcrypt.compare(password, userDB.bpassword, async function (err, res) {
      // VERIFICAMOS SI LA CONTRASEÑA COINCIDE O NO
      if (!res) {
        return callback(false, {
          message: 'La contraseña es incorrecta',
        });
      }
      // ACTUALIZAMOS LA COMISION POR SERVICIO DE RECARGAS
      const timestamp = await getServerTimestamp();
      await Database.update(DATABASE_TABLES.USERS, userDB.key, {
        comisionRecargas: parseFloat(comision),
        comisionRecargasFecha: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      });
      callback(
        {
          validUser: true,
          updatedAT: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
        },
        null,
      );
    });
  } catch ({message}) {
    throw new Error('saveRechargeCommission ' + message);
  }
}
// ENVIO DE COMPROBANTE DE TRANSACCION
export const sendTransactionReceipt = async transactionData => {
  try {
    // VERIFICAR ESTADO DEL USUARIO ANTES DE PROCESAR
    await obtenerUsuarioDb();
    // Validar datos requeridos
    const requiredFields = [
      'correo',
      'status',
      'monto',
      'referencia',
      'carrier',
      'bolsa',
      'folio',
      'transID',
      'tienda',
      'comision',
      'total',
      'fecha',
    ];
    for (const field of requiredFields) {
      if (!transactionData[field]) {
        throw new Error(`Falta el campo requerido: ${field}`);
      }
    }
    const rymResponse = await requestRymAPI('emails/enviarComprobante', {
      correo: transactionData.correo,
      transaccion: transactionData,
    });

    return rymResponse;
  } catch (error) {
    console.error('[Error]:', error.message, '[Func]: sendTransactionReceipt');
    throw new Error('Error al enviar el comprobante de la transacción.');
  }
};
/**
 * Obtiene las últimas transacciones de un usuario en un rango de fechas determinado.
 * @param {number} [numTransLimit=100] - Número máximo de transacciones a devolver.
 * @returns {Promise<Object[]>} Lista de transacciones filtradas y limitadas.
 */
export async function getLastTransactions(numTransLimit = 100) {
  try {
    const userDB = await obtenerUsuarioDb();
    const timestamp = await Database.getServerDate();
    const {start, end} = getPeriodFromMonday(timestamp);

    // Obtener transacciones dentro del rango de fechas y filtrar por usuario
    const transactions = (
      await Database.getItemsInRange(
        DATABASE_TABLES.TRANSACTIONS,
        '_fecha',
        start,
        end,
        txn => txn._usuario === userDB.usuario,
      )
    ).reverse();
    // Retornar directamente si la cantidad de transacciones es menor o igual al límite
    return transactions.slice(0, numTransLimit);
  } catch (error) {
    throw new Error(
      `getLastTransactions: ${error.message || 'Error desconocido'}`,
    );
  }
}

/**
 * Obtiene las últimas transacciones de un usuario a través de la API.
 * @param {number} [numTransLimit=100] - Número máximo de transacciones a devolver.
 * @returns {Promise<Object[]>} Lista de transacciones filtradas y limitadas.
 */
export async function getLastTransactionsApi(numTransLimit = 100) {
  try {
    const response = await requestRymAPI(
      'taecel/recent-transactions',
      {limit: numTransLimit},
      true,
      'GET',
    );
    
    if (response.error) {
      throw new Error(response.error_message);
    }

    return response.data || [];
  } catch (error) {
    throw new Error(
      `getLastTransactionsApi: ${error.message || 'Error desconocido'}`,
    );
  }
}
// TRANSACTION FALIED
function transactionFailed(status) {
  return ['ERROR', 'FAILED', 'PROCESSING'].includes(status);
}
