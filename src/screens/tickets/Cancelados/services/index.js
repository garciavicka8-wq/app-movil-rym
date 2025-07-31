import {Storage, Utils} from '../../../../utils';
import * as Request from '../../../../services/http';
import Database from '../../../../database';
import {obtenerUsuarioDb} from '../../../../services/auth';
import {DATABASE_TABLES} from '../../../../services/constants';

const {
  buildFileObj,
  getWeekPeriod,
  sortListByDate,
  compressImage,
  deleteCapturedImage,
} = Utils;
const {requestRymAPI} = Request;
const {getServerDate, getItemsInRange} = Database;
const {CANCELED_TICKETS} = DATABASE_TABLES;

export async function cancelTicket(numeroBoleto, capturaUri) {
  const {usuario} = Storage.getUser();
  const compressedUri = await compressImage(capturaUri);
  const formData = new FormData();
  formData.append('numero_usuario', usuario);
  formData.append('numero_boleto', numeroBoleto);
  formData.append('captura', buildFileObj(compressedUri));
  formData.append('medio', 'app');

  const response = await requestRymAPI(
    'tickets/cancelarTicket',
    formData,
    false,
  );
  if (response.error) {
    throw new Error(response.error_message);
  }
  // Delete the captured image from storage
  await deleteCapturedImage(compressedUri);
  await deleteCapturedImage(capturaUri);

  return response.data;
}

export async function getCanceledTickets() {
  try {
    const timestamp = await getServerDate();
    const {start, end} = getWeekPeriod(timestamp, 'hoy');
    const {usuario} = await obtenerUsuarioDb();
    const boletos = await getItemsInRange(
      CANCELED_TICKETS,
      'fechaCancelacion',
      start,
      end,
      item => item.agencia == usuario,
    );

    return sortListByDate(boletos, 'fechaCancelacion', 'horaCancelacion');
  } catch ({message}) {
    throw new Error(message);
  }
}
