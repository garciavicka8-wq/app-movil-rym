import {Utils} from '../../../../utils';
import {requestRymAPIConfig} from '../../../../services/http';

const {buildFileObj, compressImage, deleteCapturedImage} = Utils;

export const verifyTicket = async numeroBoleto => {
  const response = await requestRymAPIConfig({
    endpoint: 'tickets/verificarBoletoPremiado',
    data: {numero_boleto: numeroBoleto},
    method: 'POST',
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

  const response = await requestRymAPIConfig({
    endpoint: 'tickets/pagarPremio',
    data: formData,
    useJson: false,
  });

  if (response.error) {
    throw new Error(response.error_message);
  }

  await deleteCapturedImage(compressedUri);
  await deleteCapturedImage(capturaUri);

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
