import {RYM_API_URL} from '../../constants';
import axios from 'axios';
import {Storage} from '../../utils';

export async function get(endpoint) {
  const url = `${RYM_API_URL}/${endpoint}`;
  return axios.get(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${Storage.getUser().token}`,
    },
  });
}

export async function post(endpoint, data = undefined, withHeaders = true) {
  const url = `${RYM_API_URL}/${endpoint}`;
  const headers = withHeaders
    ? {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Storage.getItem('user', true).token}`,
        },
      }
    : undefined;
  return axios.post(url, data, headers);
}

// Función genérica para manejar solicitudes POST con manejo de errores
export async function postRequest(endpoint, data) {
  try {
    const response = await post(endpoint, data);
    if (response.data?.error) {
      throw new Error(response.data.error_message || 'Error en la solicitud');
    }
    return response.data?.data || response.data;
  } catch (error) {
    throw new Error(error.message || 'Ocurrió un error inesperado');
  }
}
