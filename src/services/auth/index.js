import {
  getDeviceName,
  getSystemName,
  getSystemVersion,
  getUniqueId,
} from 'react-native-device-info';
import {Utils, Storage} from '../../utils';
import VersionCheck from 'react-native-version-check';
import {ERROR_CODE_NAMES} from '../../errors';
import {requestRymAPI} from '../http';

export async function loginAppApi(numeroUsuario, password) {
  try {
    const device = {
      uniqueId: await getUniqueId(),
      name: await getDeviceName(),
      systemVersion: getSystemVersion(),
      systemName: getSystemName(),
    };
    const appVersion = VersionCheck.getCurrentVersion();

    const responseData = await requestRymAPI('authentication/login-app', {
      usuario: numeroUsuario,
      password,
      device,
      appVersion,
    });

    if (responseData.error) {
      throw new Error(responseData.error_message);
    }
    return responseData.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export const iniciarSesionApi = async (numeroUsuario, password, callback) => {
  try {
    Storage.removeItem('tempUser');

    const device = {
      uniqueId: await getUniqueId(),
      name: await getDeviceName(),
      systemVersion: getSystemVersion(),
      systemName: getSystemName(),
    };
    const appVersion = VersionCheck.getCurrentVersion();

    const responseData = await requestRymAPI('authentication/login-app', {
      usuario: numeroUsuario,
      password,
      device,
      appVersion,
    });

    if (responseData.error) {
      const tempUser = responseData.data?.tempUser || responseData.tempUser;
      if (tempUser) {
        Storage.setItem('tempUser', tempUser, true);
      }
      let isUpdateRequired = false;
      if (responseData.data && responseData.data.update) {
        isUpdateRequired = true;
      }

      throw {
        message: responseData.error_message || 'Ocurrió un error al iniciar sesión.',
        update: isUpdateRequired,
      };
    }

    const {user, versionApp} = responseData.data;
    callback(user, versionApp, null);
  } catch (error) {
    let errorMessage = 'Ocurrió un error al iniciar sesión. Intenta nuevamente.';
    let isUpdateRequired = false;

    if (error.response && error.response.data) {
      if (error.response.status === 426) {
        isUpdateRequired = true;
      }
      errorMessage =
        error.response.data.error_message ||
        error.response.data.message ||
        errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
      if (error.update) isUpdateRequired = true;
    }

    callback(null, null, {
      message: errorMessage,
      update: isUpdateRequired,
    });
  }
};

export const iniciarSesion = iniciarSesionApi;

export const cerrarSesionApi = async () => {
  try {
    await requestRymAPI('authentication/logout');
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión en la API:', error.message);
    return false;
  }
};

export const usuarioAutenticadoApi = async (numeroUsuario, password, callback) => {
  await iniciarSesionApi(numeroUsuario, password, (user, version, error) => {
    if (error) {
      callback(false, error);
    } else {
      callback(true, null);
    }
  });
};

export const usuarioAutenticado = usuarioAutenticadoApi;
