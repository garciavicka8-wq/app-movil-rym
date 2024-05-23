import axios from 'axios';
import ENV from 'react-native-config';
import Decimal from 'decimal.js';
import {Helpers, Moment, Money, Storage, Utils, uuid} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import Database from '../../database';
import {DATABASE_TABLES, TRANSACTION_STRUCTURE} from '../constants';
import {actualizarCredito} from '../credito';
import {getPeriodFromMonday, getServerTimestamp} from '../common';
const qs = require('qs');
const bcrypt = require('react-native-bcrypt');
// GET TAECEL PRODUCTS
export const getProducts = async () => {
  try {
    const url = ENV.TAECEL_BASE_URL + '/getProducts';
    const tokens = Utils.getTokens();
    const data = qs.stringify({
      key: tokens.key,
      nip: tokens.nip,
    });
    const res = await axios.post(url, data);
    return res.data;
  } catch (error) {
    console.log('[Error]: ' + error.message, '[Func]: getProducts');
    throw Error('Error al obtener productos');
  }
};
// MAKE RECHARGE
export const makeRecharge = async (
  categoriaID,
  code,
  phoneNumber,
  total,
  descripcionProducto,
) => {
  try {
    // VERIFICAR ESTADO DEL USUARIO
    const usuarioDB = await obtenerUsuarioDb();
    let data = {
      status: 'error',
      transaccion: null,
    };
    let seconds = 0;
    // SIRVE PARA IDENTIFICAR LA TRANSACCION GUARDADA INICIALMENTE PARA POSTERIORMENTE PODER ACTUALIZARLA
    const tempId = uuid();
    //  VERIFICAR HAY SUFICIENTE CREDITO PARA REALIZAR LA TRANSACCION
    const canTransactionProceed = await checkBalance(total, 'airtime');
    if (!canTransactionProceed)
      throw new Error('No cuentas con saldo suficiente');
    // HACIENDO LA TRANSACCION
    const transID = await makeRequest(code, phoneNumber);
    if (transID === 'empty' || transID === '')
      throw new Error('Transacción fallida, ' + transID);
    // GUARDAR TRANSACCION
    await saveTransaction({
      transID,
      tempId: tempId,
      usuario: usuarioDB.usuario,
      referencia: phoneNumber,
      monto: total,
      categoriaID,
      descripcionProducto,
      comisionRecargas: usuarioDB.comisionRecargas,
      comisionRecargasFecha: usuarioDB.comisionRecargasFecha,
    });
    // OBTENER STATUS DE LA TRANSACCION Y REINTENTAR DESPUES DE 60 SEGUNDOS
    const start = new Date();
    do {
      data = await getStatusRequest(transID);
      const end = new Date();
      seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    } while (data.status === 'PROCESSING' && seconds < 60);
    // VERIFICAR SI LA TRANSACCION FALLO
    const errorStatusList = ['ERROR', 'FAILED', 'PROCESSING'];
    if (errorStatusList.includes(data.status)) {
      // UPDATE TRANSACTION
      await updateTransaction({
        tempId,
        transaccion: data.transaccion,
        categoriaID,
        descripcionProducto,
        usuario: usuarioDB.usuario,
        comisionRecargas: usuarioDB.comisionRecargas,
        comisionRecargasFecha: usuarioDB.comisionRecargasFecha,
      });
      throw new Error(`${data.transaccion.Nota}`);
    }
    // VERIFICA SI LA TRANSACCION TUVO EXITO
    if (data.status === 'SUCCESS') data.status = 'success';
    // UPDATE TRANSACTION
    await updateTransaction({
      tempId,
      transaccion: data.transaccion,
      categoriaID,
      descripcionProducto,
      usuario: usuarioDB.usuario,
      comisionRecargas: usuarioDB.comisionRecargas,
      comisionRecargasFecha: usuarioDB.comisionRecargasFecha,
    });
    // RETORNAR DATA
    return data;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: makeRecharge');
    throw new Error(message);
  }
};
// PAY SERVICE
export const payService = async (
  categoriaID,
  code,
  reference,
  total,
  descripcionProducto,
) => {
  try {
    // VERIFICAR ESTADO DEL USUARIO
    const usuarioDB = await obtenerUsuarioDb();
    let data = {
      status: 'error',
      transaccion: null,
    };
    let seconds = 0;
    // SIRVE PARA IDENTIFICAR LA TRANSACCION GUARDADA INICIALMENTE PARA POSTERIORMENTE PODER ACTUALIZARLA
    const tempId = uuid();
    //  VERIFICAR HAY SUFICIENTE CREDITO PARA REALIZAR LA TRANSACCION
    const canTransactionProceed = await checkBalance(total, 'service');
    if (!canTransactionProceed)
      throw new Error('No cuentas con saldo suficiente');
    // HACIENDO LA TRANSACCION
    const transID = await makeServiceRequest(code, reference, total);
    if (transID === 'empty' || transID === '')
      throw new Error('Transacción fallida');
    // GUARDAR TRANSACCION
    await saveTransaction({
      transID,
      tempId: tempId,
      usuario: usuarioDB.usuario,
      referencia: reference,
      monto: total,
      categoriaID,
      descripcionProducto,
    });
    // OBTENER STATUS DE LA TRANSACCION Y REINTENTAR DESPUES DE 60 SEGUNDOS
    const start = new Date();
    // console.log(transID);
    do {
      data = await getStatusRequest(transID);
      const end = new Date();
      seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    } while (data.status === 'PROCESSING' && seconds < 60);
    // VERIFICAR SI LA TRANSACCION FALLO
    const errorStatusList = ['ERROR', 'FAILED', 'PROCESSING'];
    if (errorStatusList.includes(data.status)) {
      // UPDATE TRANSACTION
      await updateTransaction({
        tempId,
        transaccion: data.transaccion,
        categoriaID,
        descripcionProducto,
        usuario: usuarioDB.usuario,
      });
      throw new Error(`${data.transaccion.Nota}`);
    }
    // VERIFICA SI LA TRANSACCION TUVO EXITO
    if (data.status === 'SUCCESS') data.status = 'success';
    // UPDATE TRANSACTION
    await updateTransaction({
      tempId,
      transaccion: data.transaccion,
      categoriaID,
      descripcionProducto,
      usuario: usuarioDB.usuario,
    });
    // RETORNAR DATA
    return data;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: payService');
    throw Error(message);
  }
};
// CHECK BALANCE
export const checkBalance = async (total, type) => {
  try {
    let balance = '0.00';
    const res = await getBalance();
    if (res.data.success) {
      if (type === 'airtime') {
        balance = res.data.data[0].Saldo;
      }
      if (type === 'service') {
        balance = res.data.data[1].Saldo;
      }
    }
    balance = parseFloat(balance.replace(/[ ,]/g, ''));
    const balanceDecimal = new Decimal(balance);
    return balanceDecimal.greaterThanOrEqualTo(total);
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: checkBalance');
    throw Error('Error al obtener el saldo');
  }
};
// GET BALANCE
export const getBalance = async () => {
  try {
    const url = ENV.TAECEL_BASE_URL + '/getBalance';
    const tokens = Utils.getTokens();
    const data = qs.stringify({
      key: tokens.key,
      nip: tokens.nip,
    });
    // console.time('request');
    const res = await axios.post(url, data);
    // console.log(res.data);
    return res;
    // console.timeEnd('request');
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: getBalance');
    throw Error('Error al obtener el balance');
  }
};
// REQUEST PARA TIEMPO AIRE Y GIFTCARDS
export const makeRequest = async (code, phoneNumber) => {
  try {
    let transID = 'empty';
    const res = await requestTXN(code, phoneNumber);
    // SI EXISTE ALGUN ERROR
    if (!res.data.success) throw Error(res.data.message);
    // SI LA PETICION TUVO EXITO
    if (res.data.success) transID = res.data.data.transID;
    // RETORNAMOS EL TRANSID
    return transID;
  } catch ({message}) {
    const _message = message ? message : 'Transacción Exitosa';
    console.log('[Error]: ' + _message, '[Func]: makeRquest');
    throw new Error(_message);
  }
};
// REQUEST PARA SERVICIOS
export const makeServiceRequest = async (code, reference, amount) => {
  try {
    let transID = 'empty';
    let auxAmount = amount;
    if (typeof amount !== 'number') {
      auxAmount = parseFloat(amount);
    }
    const res = await requestTXN(code, reference, auxAmount);
    // SI EXISTE ALGUN ERROR
    if (!res.data.success) throw Error(res.data.message);
    // console.log(res);
    if (res.data.success) transID = res.data.data.transID;
    return transID;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: makeServiceRequest');
    throw Error('Error al solicitar pago de servicio, ' + message);
  }
};
// REQUEST TXN
export const requestTXN = async (product, reference, amount) => {
  try {
    const tokens = Utils.getTokens();
    const data = {
      key: tokens.key,
      nip: tokens.nip,
      producto: product,
      referencia: reference,
    };
    // SOLO SI EXISTE EL PARAMETRO AMOUNT
    if (amount) data.monto = amount;
    // HACEMOS LA PETICION
    const url = ENV.TAECEL_BASE_URL + '/RequestTXN';
    const res = await axios.post(url, qs.stringify(data));
    return res;
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
    const timestamp = await Database.getServerDate();
    // EL ABONO SOLO APLICA A LAS GIFTCARDS = 4
    const _abono = categoriaID == '4' ? parseFloat(monto) * 0.02 : 0;
    // EL CARGO SOLO APLICA A LOS SERVICIOS = 3
    const _cargo = categoriaID == '3' ? 5 : 0;
    // LA COMISION SOLO LA APLICAN RECARGAS Y SERVICIOS = [1,2,3]
    let _comision = 0;
    // COMISION RECARGAS
    if (['1', '2'].includes(categoriaID)) {
      _comision = comisionRecargas;
    }
    // COMISION SERVICIOS
    if (['3'].includes(categoriaID)) {
      _comision = 7;
    }
    const tempTransaction = {
      ...TRANSACTION_STRUCTURE,
      TransID: transID,
      CategoriaID: categoriaID,
      // AJUSTAR DEPENDIENDO DEL TIPO DE TRANSACCION
      Abono: Money(_abono),
      Cargo: Money(_cargo),
      Comision: Money(_comision),
      Telefono: referencia,
      Monto: Money(monto),
      tempId,
      _comisionRecargas: ['1', '2'].includes(categoriaID)
        ? Money(_comision)
        : Money(0),
      _comisionRecargasFecha: ['1', '2'].includes(categoriaID)
        ? comisionRecargasFecha
        : '',
      _usuario: usuario,
      _fecha: Moment(timestamp).format('YYYY-MM-DD'),
      _hora: Moment(timestamp).format('HH:mm:ss'),
      descripcionProducto,
    };
    await Database.save(DATABASE_TABLES.TRANSACTIONS, tempTransaction);
  } catch ({message}) {
    throw new Error('saveTransaction ' + message);
  }
}
// GET TXN STATUS
export const getStatusRequest = async transID => {
  try {
    const res = await statusTXN(transID);
    const response = res.data;
    let status = 'FAILED';
    // console.log('getStatusRequest: ', response.data);
    if (!response.success || response.data.Status === 'Fracasada') {
      status = 'FAILED';
    }
    if (response.success && response.data.Status === '') {
      status = 'PROCESSING';
    }
    if (response.success && response.data.Status === 'Exitosa') {
      status = 'SUCCESS';
    }
    return {status: status, transaccion: response.data};
  } catch ({message}) {
    const _message = message ? message : 'Transacción Exitosa';
    console.log('[Error]: ' + _message, '[Func]: getStatusRequest');
    throw Error(_message);
  }
};
// TXN STATUS
export const statusTXN = async transID => {
  try {
    const url = ENV.TAECEL_BASE_URL + '/StatusTXN';
    const tokens = Utils.getTokens();
    const data = qs.stringify({
      key: tokens.key,
      nip: tokens.nip,
      transID,
    });
    const res = await axios.post(url, data);
    return res;
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
      let newTransaccion = {
        ...transaccion,
        CategoriaID: categoriaID,
        _usuario: usuario,
        _fecha: Moment(transaccion.Fecha).format('YYYY-MM-DD'),
        _hora: Moment(transaccion.Fecha).format('HH:mm:ss'),
        descripcionProducto,
        // SE APLICA SOLO PARA RECARGAS
        _comisionRecargas: ['1', '2'].includes(categoriaID)
          ? Money(comisionRecargas)
          : Money(0),
        _comisionRecargasFecha: ['1', '2'].includes(categoriaID)
          ? comisionRecargasFecha
          : '',
      };
      // SI ES UNA RECARGA
      await Database.save(
        DATABASE_TABLES.TRANSACTIONS,
        newTransaccion,
        prevTransaccion.key,
      );
    }
    // ACTUALIZAMOS EL CREDITO SI LA TRANSACCION FUE EXITOSA
    if (transaccion.Status === 'Exitosa') {
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
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: updateTransaction');
    throw new Error(message);
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
export async function saveRechargeCommission(comision, password, callback) {
  try {
    const userStorage = Storage.getItem('usuario', true);
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
export const sendTransactionReceipt = async ({
  correo,
  status,
  monto,
  referencia,
  carrier,
  bolsa,
  folio,
  transID,
  tienda,
  comision,
  total,
  fecha,
}) => {
  try {
    // VERIFICAR ESTADO DEL USUARIO
    await obtenerUsuarioDb();
    const transaccion = qs.stringify({
      emailRecipient: correo,
      status,
      monto,
      referencia,
      carrier,
      bolsa,
      folio,
      transID,
      tienda,
      comision,
      total,
      fecha,
    });
    const res = await axios.post(
      ENV.RYM_API_URL + '/enviarComprobante',
      transaccion,
    );
    return res;
  } catch ({message}) {
    console.log('[Error]: ' + message, '[Func]: sendTransactionReceipt');
    throw new Error(message);
  }
};

export async function getLastTransactions(numTransLimit = 100) {
  try {
    const userDB = await obtenerUsuarioDb();
    const timestamp = await Database.getServerDate();
    const periodo = getPeriodFromMonday(timestamp);
    let lastTransactions = [];
    const transactions = await Database.getItemsInRange(
      DATABASE_TABLES.TRANSACTIONS,
      '_fecha',
      periodo.start,
      periodo.end,
      txn => txn._usuario == userDB.usuario,
    );
    transactions.reverse();
    // IF THERE ARE LESS THAN 5 TRANS THEN RETURN TRANSACTIONS
    if (transactions.length <= numTransLimit) return transactions;
    // IF THERE ARE MORE THAN 5 TRANS THEN DO THE NEXT STEP
    for (let i = 0; i < numTransLimit; i++) {
      lastTransactions.push(transactions[i]);
    }
    return lastTransactions;
  } catch ({message}) {
    throw new Error('getLastTransactions ' + message);
  }
}
