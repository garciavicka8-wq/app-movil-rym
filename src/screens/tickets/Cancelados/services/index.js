import {Storage, Utils} from '../../../../utils';
import * as Request from '../../../../services/http';

const {
  buildFileObj,
  compressImage,
  deleteCapturedImage,
} = Utils;
const {requestRymAPIConfig} = Request;

export async function cancelTicket(numeroBoleto, capturaUri) {
  const {usuario} = Storage.getUser();
  const compressedUri = await compressImage(capturaUri);
  const formData = new FormData();
  formData.append('numero_usuario', usuario);
  formData.append('numero_boleto', numeroBoleto);
  formData.append('captura', buildFileObj(compressedUri));
  formData.append('medio', 'app');

  const response = await requestRymAPIConfig({
    endpoint: 'tickets/cancelarTicket',
    data: formData,
    useJson: false,
  });
  if (response.error) {
    throw new Error(response.error_message);
  }
  // Delete the captured image from storage
  await deleteCapturedImage(compressedUri);
  await deleteCapturedImage(capturaUri);

  return response.data;
}

export async function getCanceledTicketsApi() {
  const response = await requestRymAPIConfig({
    endpoint: 'tickets/cancelados',
    method: 'GET',
  });
  if (response.error) {
    throw new Error(response.error_message);
  }
  return response.data;
}
