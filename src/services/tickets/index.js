import * as Request from '../http';

// OBTENER PROXIMOS SORTEOS API
export async function obtenerProximosSorteosApi() {
  try {
    const response = await Request.get('sorteos/proximos');
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
// OBTENER ULTIMOS SORTEOS API
export async function obtenerUltimosSorteosApi() {
  try {
    const response = await Request.get('sorteos/ultimos');
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
// OBTENER GANADORES API
export const obtenerPublicacionNumerosGanadoresApi = async fechaSorteo => {
  try {
    const response = await Request.requestRymAPIConfig({
      endpoint: 'sorteos/ganadores',
      data: {fecha_sorteo: fechaSorteo},
    });
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

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
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function obtenerPeriodosReporteApi() {
  try {
    const response = await Request.get('tickets/report-periods');
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function obtenerVouchersApi(usuario) {
  try {
    const response = await Request.get(`comprobantes/vouchers?number=${usuario}`);
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
