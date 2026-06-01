import {requestRymAPI} from '../../../../services/http';
import {Storage} from '../../../../utils';

export async function registrarTicketApi(
  sorteoId,
  jugadas,
  via,
  telefono = null,
) {
  try {
    const usuario = Storage.getUser();
    const res = await requestRymAPI('tickets/registrarTicketPlus', {
      sorteo_id: sorteoId,
      numero_usuario: usuario.usuario,
      jugadas,
      via,
      telefono,
    });

    if (res.data.saturados && res.data.saturados.length > 0) {
      // console.log(res.data.saturados);
      Storage.setItem('saturados', res.data.saturados, true);
      throw new Error(res.data.message);
    }

    if (res.error) {
      throw new Error(res.error_message);
    }

    return res.data;
  } catch (error) {
    // console.log(error.message);
    throw new Error(error.message || 'Error al registrar el ticket');
  }
}

export async function registrarMagicoApi(
  sorteoId,
  numeroJugadas,
  lugares,
  numeroCifras,
  via,
  telefono = null,
) {
  try {
    const usuario = Storage.getUser();
    const res = await requestRymAPI('tickets/registrarTicketPlusAutomatico', {
      sorteo_id: sorteoId,
      numero_usuario: usuario.usuario,
      numero_jugadas: numeroJugadas,
      lugares,
      numero_cifras: numeroCifras,
      via,
      telefono,
    });

    if (res.error) {
      throw new Error(res.error_message);
    }

    return res.data;
  } catch (error) {
    // console.log(error.message);
    throw new Error(error.message || 'Error al registrar el ticket');
  }
}
