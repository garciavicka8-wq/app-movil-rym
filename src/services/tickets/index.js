import Database from '../../database';
import {Helpers, Moment, Utils} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import {DATABASE_TABLES} from '../constants';
import * as Request from '../http';
const {DRAWS, DRAWS_LIST, CREDITS, CLOSING_TIME} = DATABASE_TABLES;
const {getItem, getItems, getObject, getServerDate} = Database;

export const obtenerSorteos = async () => {
  try {
    await obtenerUsuarioDb();
    const sorteos = await getItems(DRAWS);
    const sorteosOpciones = await getItems(DRAWS_LIST);
    sorteos.forEach(s => {
      const opcion = sorteosOpciones.find(o => o.codigo === s.codigoSorteo);
      const numLugares = s.codigoSorteo === 'GN' ? 2 : opcion.numLugares;
      s.numLugares = numLugares;
    });
    return sorteos;
  } catch ({message}) {
    throw new Error(message);
  }
};
// OBTENER CREDITO DISPONIBLE
export async function obtenerCreditoDisponible() {
  try {
    const {usuario} = await obtenerUsuarioDb();
    const {saldo} = await getItem(CREDITS, 'usuario', usuario);
    return saldo;
  } catch ({message}) {
    throw new Error(message);
  }
}
// OBTENER PROXIMOS SORTEOS (DEPRECATED -> USE obtenerProximosSorteosApi)
export const obtenerProximosSorteos = async () => {
  try {
    const sorteos = await obtenerSorteos();
    const horaCierre = await getObject(CLOSING_TIME);
    const timestamp = await getServerDate();

    const horaActual = Moment(timestamp);
    const horaCierreMoment = Moment(horaCierre.hora, 'HH:mm');
    const fechaActual = horaActual.format('YYYY-MM-DD');
    const horaActualStr = horaActual.format('HH:mm');

    // Filtrar sorteos que aún no han cerrado
    const proximosSorteos = sorteos
      .filter(sorteo => {
        const fechaSorteo = Moment(sorteo.fecha);
        if (fechaSorteo.isBefore(fechaActual)) return false;
        if (
          fechaSorteo.isSame(fechaActual) &&
          Moment(horaActualStr, 'HH:mm').isSameOrAfter(horaCierreMoment)
        ) {
          return false;
        }
        return true;
      })
      .map(sorteo => ({...sorteo, selected: false}));

    // Ordenar por fecha ascendente
    const ordenados = Helpers.sortListByDate(proximosSorteos, 'fecha', 'asc');

    // Marcar el primero como seleccionado si existe
    if (ordenados.length > 0) {
      ordenados[0].selected = true;
    }

    return ordenados;
  } catch ({message}) {
    throw new Error(message);
  }
};
// OBTENER PROXIMOS SORTEOS API
export async function obtenerProximosSorteosApi() {
  try {
    const response = await Request.get('sorteos/proximos');
    if(response.data.error){
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
// OBTENER GANDORES
export const obtenerPublicacionNumerosGanadores = async fechaSorteo => {
  try {
    const numerosGanadores = await Database.getItem(
      DATABASE_TABLES.WINNER_NUMBERS,
      'fechaSorteo',
      fechaSorteo,
    );
    return numerosGanadores;
  } catch ({message}) {
    throw new Error(message);
  }
};
// GET PAID PRIZES
export async function getPaidPrizes() {
  try {
    // VERIFICAMOS AL USUARIO
    const usuarioDB = await obtenerUsuarioDb();
    const timestamp = await Database.getServerDate();
    const periodo = Utils.getWeekPeriod(timestamp, 'hoy');
    const pagosRealizados = await Database.getItemsInRange(
      DATABASE_TABLES.PAID_PRIZES,
      'fechaPago',
      periodo.start,
      periodo.end,
      item => item.pagadoPor == usuarioDB.usuario,
    );
    return pagosRealizados;
  } catch ({message}) {
    throw new Error(message);
  }
}

export async function uploadTicketCapture(formData) {
  try {
    const response = await Request.post(
      'comprobantes/premios/subirCaptura',
      formData,
      false,
    );
    if (response.data.data.error) {
      throw new Error(response.data.data.error_message);
    }

    return response.data.data.url || '';
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function requestTicketCancellation(formData) {
  try {
    const response = await Request.post('solicitudes/cancelar', formData, false);
    if(response.data.error){
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
