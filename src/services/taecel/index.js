import {Storage} from '../../utils';
import {logError} from '../logger';
import {requestRymAPI, requestTaecelAPI} from '../http';
import {TRANSACTION_STATES} from '../../constants';

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

    const index = type === 'airtime' ? 0 : type === 'service' ? 1 : -1;
    if (index === -1 || !taecelResponse.data[index]?.Saldo) {
      throw new Error(`Tipo de saldo inválido: ${type}`);
    }

    const Decimal = require('decimal.js');
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
    const taecelResponse = await requestTaecelAPI('RequestTXN', {
      producto: product,
      referencia: reference,
      ...(amount ? {monto: amount} : {}),
    });
    return taecelResponse;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: requestTXN');
    throw Error('Error al hacer la petición, ' + message);
  }
};

/**
 * @typedef {Object} TransactionStatusResponse
 * @property {'SUCCESS' | 'PROCESSING' | 'FAILED'} status
 * @property {Object | null} transaccion
 */
export const getStatusRequest = async transID => {
  try {
    const taecelResponse = await statusTXN(transID);

    const {Status} = taecelResponse.data;

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
    const errorMessage = error?.message ?? 'Error desconocido en la transacción';
    logError('getStatusRequest', errorMessage);
    throw new Error(errorMessage);
  }
};

// TXN STATUS
export const statusTXN = async transID => {
  try {
    const taecelResponse = await requestTaecelAPI('StatusTXN', {transID});
    return taecelResponse;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: statusTXN');
    throw Error('Error al solicitar el status');
  }
};

// ENVIO DE COMPROBANTE DE TRANSACCION
export const sendTransactionReceipt = async transactionData => {
  try {
    const requiredFields = [
      'correo', 'status', 'monto', 'referencia', 'carrier',
      'bolsa', 'folio', 'transID', 'tienda', 'comision', 'total', 'fecha',
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

export async function getTransactionsApi(start, end) {
  try {
    const response = await requestRymAPI(
      'taecel/recent-transactions',
      {start, end},
      true,
      'GET',
    );
    if (response.error) {
      throw new Error(response.error_message);
    }
    return response.data || [];
  } catch (error) {
    throw new Error(
      `getTransactionsApi: ${error.message || 'Error desconocido'}`,
    );
  }
}

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

export async function actualizarTransaccionApi(TransID) {
  try {
    const response = await requestRymAPI(
      'taecel/actualizar-transaccion',
      {TransID},
      true,
      'POST',
    );
    if (response.error) {
      throw new Error(response.error_message);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

function transactionFailed(status) {
  return ['ERROR', 'FAILED', 'PROCESSING'].includes(status);
}
