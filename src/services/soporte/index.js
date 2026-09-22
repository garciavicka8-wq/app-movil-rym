import * as Request from '../http';
import {Utils} from '../../utils';

const {buildFileObj, compressImage, deleteCapturedImage} = Utils;

export async function subirImagenSoporteApi(imageUri) {
  const compressedUri = await compressImage(imageUri);
  const formData = new FormData();
  formData.append('imagen', buildFileObj(compressedUri));

  const response = await Request.requestRymAPIConfig({
    endpoint: 'soporte/solicitudes/imagen',
    data: formData,
    useJson: false,
  });
  if (response.error) {
    throw new Error(response.error_message);
  }

  await deleteCapturedImage(compressedUri);
  await deleteCapturedImage(imageUri);

  return response.data.url;
}

export async function crearSolicitudSoporteApi(
  numeroUsuario,
  tipo,
  detalle,
  payload = {},
  imagenUrl = null,
) {
  try {
    const response = await Request.post('soporte/solicitudes', {
      numero_usuario: numeroUsuario,
      tipo,
      detalle,
      payload,
      imagen_url: imagenUrl,
    });
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function misSolicitudesSoporteApi(numeroUsuario) {
  try {
    const response = await Request.get(
      `soporte/solicitudes/mias?numero_usuario=${numeroUsuario}`,
    );
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
