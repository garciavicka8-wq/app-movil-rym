import axios from 'axios';
import ENV from 'react-native-config';
import {Storage, Utils} from '../../utils';
import {RYM_API_URL} from '../../constants';

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
  // FOR DEBUG ONLY
  if (__DEV__) {
    console.log(`development enviroment [http->post]: ${url}`);
  }
  return axios.post(url, data, headers);
}

// Función genérica para manejar solicitudes POST con manejo de errores
export async function postRequest(endpoint, data) {
  try {
    // FOR DEBUG ONLY
    if (__DEV__) {
      console.log(`development enviroment [http->postRequest]: ${endpoint}`);
    }
    const response = await post(endpoint, data);
    if (response.data?.error) {
      throw new Error(response.data.error_message || 'Error en la solicitud');
    }
    return response.data?.data || response.data;
  } catch (error) {
    throw new Error(error.message || 'Ocurrió un error inesperado');
  }
}
/**
 * @typedef {Object} TaecelApiResponse
 * @property {boolean} success - Indica si la solicitud fue exitosa.
 * @property {number} error - Código de error (0 si no hay error).
 * @property {string} message - Mensaje descriptivo de la respuesta.
 * @property {Array|Object} data - Datos de la respuesta (puede ser un array o un objeto).
 * @property {any} extra - Datos adicionales (puede ser `null` o cualquier otro valor).
 */

/**
 * Realiza una solicitud POST a la API.
 * @param {string} endpoint - La ruta del endpoint.
 * @param {Object|FormData} data - Datos a enviar en la solicitud.
 * @returns {Promise<TaecelApiResponse>} - Retorna un objeto con la respuesta de la API.
 */
export async function requestTaecelAPI(endpoint, data = {}) {
  try {
    const tokens = Utils.getTokens();
    if (!tokens?.key || !tokens?.nip) {
      throw new Error('Faltan credenciales de autenticación.');
    }

    const url = `${ENV.TAECEL_BASE_URL}/${endpoint}`;
    const requestData = new URLSearchParams({
      key: tokens.key,
      nip: tokens.nip,
      ...data,
    });

    const response = await axios.post(url, requestData.toString(), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

    if (response.status !== 200) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('[requestTaecelAPI] Error:', error.message);
    throw new Error('Error al comunicarse con la API de Taecel.');
  }
}

/**
 * @typedef {Object} RymApiResponse
 * @property {boolean} status - Indica el Status HTTP.
 * @property {boolean} success - Indica si la petición fue exitosa.
 * @property {string} success_message - Mensaje descriptivo.
 * @property {boolean} error - Indica si hubo un error en la solicitud.
 * @property {string} error_message - Mensaje descriptivo del error en caso de fallo.
 * @property {any[]} data - Contiene los datos devueltos por la API.
 */

/**
 * Realiza una solicitud POST a la API de Recargas y Más (RYM).
 *
 * @param {string} endpoint - El endpoint al que se realizará la petición.
 * @property {Array|Object} data - Datos de la respuesta (puede ser un array o un objeto).
 * @returns {Promise<RymApiResponse>} - Promesa que resuelve con la respuesta de la API.
 */
export async function requestRymAPI(endpoint, data = {}, useJson = true) {
  try {
    const url = `${RYM_API_URL}/${endpoint}`;

    // Formatear los datos según el tipo de Content-Type
    const requestData = useJson ? data : new URLSearchParams(data).toString();

    const headers = {
      'Content-Type': useJson
        ? 'application/json'
        : 'application/x-www-form-urlencoded',
    };

    // Enviar la solicitud con Axios
    const response = await axios.post(url, useJson ? data : requestData, {
      headers,
    });

    return response.data; // Devuelve la respuesta del servidor
  } catch (error) {
    // Manejo mejorado de errores
    if (error.response) {
      console.error(
        `[requestRymAPI] Error ${error.response.status}:`,
        error.response.data,
      );
      throw new Error(
        `Error API ${error.response.status}: ${
          error.response.data.message || 'Error desconocido'
        }`,
      );
    } else {
      console.error('[requestRymAPI] Error:', error.message);
      throw new Error('Error al comunicarse con la API de Recargas y Más.');
    }
  }
}
