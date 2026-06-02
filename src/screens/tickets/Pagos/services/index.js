import {Utils} from '../../../../utils';
import {requestRymAPIConfig} from '../../../../services/http';

const {buildFileObj, compressImage, deleteCapturedImage} = Utils;

export const verifyTicket = async (numeroBoleto, capturaUri) => {
  const compressedUri = await compressImage(capturaUri);
  const formData = new FormData();
  formData.append('numero_boleto', numeroBoleto);
  formData.append('captura', buildFileObj(compressedUri));

  const response = await requestRymAPIConfig({
    endpoint: 'tickets/verificarBoletoPremiado',
    data: formData,
    method: 'POST',
    useJson: false,
  });

  await deleteCapturedImage(compressedUri);

  if (response.error) {
    throw new Error(response.error_message);
  }
  return response.data;
};

export async function registrarPago(
  numeroUsuario,
  numeroBoleto,
  premio,
  imageKey,
) {
  const response = await requestRymAPIConfig({
    endpoint: 'tickets/pagarPremio',
    data: {
      numero_usuario: numeroUsuario,
      numero_boleto: numeroBoleto,
      premio,
      image_key: imageKey,
    },
    method: 'POST',
  });

  if (response.error) {
    throw new Error(response.error_message);
  }

  return response.data;
}

export async function obtenerPremiosPagadosApi() {
  const response = await requestRymAPIConfig({
    endpoint: 'tickets/pagosRealizados',
    method: 'GET',
  });
  if (response.error) {
    throw new Error(response.error_message);
  }
  return response.data;
}
