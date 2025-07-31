import {Utils} from '../../../../utils';
import * as Request from '../../../../services/http';
import {obtenerUsuarioDb} from '../../../../services/auth';
import Database from '../../../../database';
import {DATABASE_TABLES} from '../../../../services/constants';

const {requestRymAPI} = Request;
const {buildFileObj, getWeekPeriod, compressImage, deleteCapturedImage} = Utils;
const {getServerDate, getItemsInRange} = Database;
const {PAID_PRIZES} = DATABASE_TABLES;

export const verifyTicket = async numeroBoleto => {
  const response = await requestRymAPI('tickets/verificarBoletoPremiado', {
    numero_boleto: numeroBoleto,
  });
  if (response.error) {
    throw new Error(response.error_message);
  }
  return response.data;
};

export async function registrarPago(
  numeroUsuario,
  numeroBoleto,
  premio,
  capturaUri,
) {
  const formData = new FormData();
  const compressedUri = await compressImage(capturaUri);
  formData.append('numero_usuario', numeroUsuario);
  formData.append('numero_boleto', numeroBoleto);
  formData.append('premio', premio);
  formData.append('captura', buildFileObj(compressedUri));

  const response = await requestRymAPI('tickets/pagarPremio', formData, false);

  if (response.error) {
    // console.log(response);
    throw new Error(response.error_message);
  }

  // Delete the captured image from storage
  await deleteCapturedImage(compressedUri);
  await deleteCapturedImage(capturaUri);

  return response.data;
}

export async function obtenerPremiosPagados() {
  // VERIFICAMOS AL USUARIO
  const {usuario} = await obtenerUsuarioDb();
  const timestamp = await getServerDate();
  const {start, end} = getWeekPeriod(timestamp, 'hoy');
  const pagosRealizados = await getItemsInRange(
    PAID_PRIZES,
    'fechaPago',
    start,
    end,
    item => item.pagadoPor == usuario,
  );
  return pagosRealizados;
}
