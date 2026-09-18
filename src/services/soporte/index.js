import * as Request from '../http';

export async function crearSolicitudSoporteApi(
  numeroUsuario,
  tipo,
  detalle,
  payload = {},
) {
  try {
    const response = await Request.post('soporte/solicitudes', {
      numero_usuario: numeroUsuario,
      tipo,
      detalle,
      payload,
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
