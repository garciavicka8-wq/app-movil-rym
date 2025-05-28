import Database from '.';
import {DATABASE_TABLES} from '../services/constants';
import {actualizarCredito} from '../services/credito';
import {Moment, Utils} from '../utils';

const {totalWithoutCommissionTicket} = Utils;
const {DRAWS, CREDITS, CLOSING_TIME, TICKETS, BET_LIMIT} = DATABASE_TABLES;
const {getItem, getItemsByProp, getObject, getServerDate, save} = Database;

export async function getSorteo(id) {
  const sorteo = await getItem(DRAWS, 'id', id);
  // SI EL SORTEO NO EXISTE
  if (!sorteo) throw new Error('El sorteo que intentas jugar no existe');
  // SI EL SORTEO ESTA INACTIVO
  if (sorteo.activo !== undefined && !sorteo.activo)
    throw new Error('El sorteo que intentas jugar fue desactivado');
  // OBTENEMOS LA HORA DE CIERRE DEL SORTEO
  const horaCierre = await getHoraCierre();
  // OBTENEMOS LA FECHA DEL SERVIDOR
  const timestamp = await getTimestamp();
  const fecha = {
    servidor: timestamp,
    actual: Moment(timestamp).format('YYYY-MM-DD'),
    sorteo: sorteo.fecha,
  };
  const hora = {
    cierre: horaCierre.hora,
    actual: Moment(timestamp).format('HH:mm'),
  };
  // SI EL SORTEO SE CELEBRA HOY Y YA CERRO
  if (
    Moment(fecha.sorteo).isSame(fecha.actual) &&
    Moment(hora.actual, 'HH:mm').isSameOrAfter(Moment(hora.cierre, 'HH:mm'))
  ) {
    throw new Error('Lo sentimos, el sorteo ha cerrado');
  }
  // SI EL SORTEO YA SE CELEBRO
  if (Moment(fecha.actual).isAfter(fecha.sorteo)) {
    throw new Error('Lo sentimos, el sorteo seleccionado ya fue celebrado');
  }

  return sorteo;
}

export async function getHoraCierre() {
  const horaCierre = await getObject(CLOSING_TIME);
  return horaCierre;
}

export async function getTicketsPorSorteo(fechaSorteo) {
  const tickets = await getItemsByProp(TICKETS, 'fechaSorteo', fechaSorteo);

  return tickets;
}

export async function getLimiteApuestas() {
  const limiteApuestas = await getObject(BET_LIMIT);
  return limiteApuestas;
}

export async function saveTicket(ticket) {
  await save(TICKETS, ticket);
}

export async function updateCreditoUsuario(numeroUsuario, totalApostado) {
  const credito = await getItem(CREDITS, 'usuario', numeroUsuario);
  // VERIFICAMOS SI EXISTE EL CREDITO
  if (credito) {
    // RESTAMOS LA VENTA DEL BOLETO AL CREDITO DISPONIBLE
    const totalVentaBoleto = totalWithoutCommissionTicket(totalApostado);
    const saldoNuevo = credito.saldo - totalVentaBoleto;
    // console.log('actualizar saldo esta desactivado, no olvidar reactivarlo');
    await actualizarCredito(saldoNuevo, credito.key);
    // console.log(saldoNuevo, totalVentaBoleto);
  }
}

export async function getTimestamp() {
  const timestamp = await getServerDate();
  return timestamp;
}
