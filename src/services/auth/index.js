import {
  getDeviceName,
  getSystemName,
  getSystemVersion,
  getUniqueId,
} from 'react-native-device-info';
import {DATABASE_TABLES} from '../constants';
import Database from '../../database';
import {Utils, Moment, Storage} from '../../utils';
import VersionCheck from 'react-native-version-check';
import {ERROR_CODE_NAMES} from '../../errors';
import {requestRymAPI} from '../http';

export async function loginAppApi(numeroUsuario, password){
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
      appVersion
    });
    
    if(responseData.error){
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
      appVersion
    });

    if (responseData.error) {
       // Si hay tempUser en data
       const tempUser = responseData.data?.tempUser || responseData.tempUser;
       if (tempUser) {
         Storage.setItem('tempUser', tempUser, true);
       }
       // En caso de que se envíe una bandera de update
       let isUpdateRequired = false;
       if (responseData.data && responseData.data.update) {
          isUpdateRequired = true;
       }
       
       throw { 
         message: responseData.error_message || 'Ocurrió un error al iniciar sesión.', 
         update: isUpdateRequired 
       };
    }

    const { user, versionApp } = responseData.data;
    callback(user, versionApp, null);
  } catch (error) {
    let errorMessage = 'Ocurrió un error al iniciar sesión. Intenta nuevamente.';
    let isUpdateRequired = false;

    if (error.response && error.response.data) {
      if (error.response.status === 426) {
        isUpdateRequired = true;
      }
      errorMessage = error.response.data.error_message || error.response.data.message || errorMessage;
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

// Mantenemos la firma local antigua como alias a la API para no romper implementaciones no detectadas
export const iniciarSesion = iniciarSesionApi;

async function verifyDeviceRegistration(usuarioDB) {
  try {
    // VERIFICAR DISPOSITIVO REGISTRADO
    const devicesRegistered = await Database.getItemsByProp(
      DATABASE_TABLES.REGISTERED_DEVICES,
      'userId',
      usuarioDB.id,
    );
    // SI NO SE ENCUENTRA NINGUN REGISTRO CREAMOS UNO
    if (devicesRegistered.length === 0) {
      //  REGISTRAMOS EL NUEVO DISPOSITIVO
      await registerDevice(usuarioDB.id);
    }
    //  SI EXISTEN DISPOSITIVOS REGISTRADOS
    if (devicesRegistered.length > 0) {
      // INFORMACION DISPOSITIVO
      const currentDevice = {
        uniqueId: await getUniqueId(),
        name: await getDeviceName(),
        systemVersion: getSystemVersion(),
        systemName: getSystemName(),
      };
      let devicesMatched = false;
      devicesRegistered.forEach(device => {
        // VERIFICAMOS SI LA INFORMACION DE AMBOS DISPOSITIVOS ES LA MISMA
        if (device.uniqueId == currentDevice.uniqueId) {
          devicesMatched = true;
        }
      });
      // SI LOS DISPOSITIVOS NO COINCIDEN Y LA PROPIEDAD DE DEVICES ALLOWED ES IGUAL AL
      // NUMERO DE ELEMENTOS ENCONTRADOS
      if (
        !devicesMatched &&
        usuarioDB.devicesAllowed == devicesRegistered.length
      ) {
        return 'DEVICE_NOT_LINKED';
      }
      // SI LOS DISPOSITIVOS NO COINCIDEN Y LA PROPIEDAD DE DEVICES ALLOWED ES MAYOR AL
      // NUMERO DE ELEMENTOS ENCONTRADOS ENTONCES REGISTRAMOS EL NUEVO DISPOSITIVO
      if (
        !devicesMatched &&
        usuarioDB.devicesAllowed > devicesRegistered.length
      ) {
        //  REGISTRAMOS EL NUEVO DISPOSITIVO
        await registerDevice(usuarioDB.id);
      }
    }
    return 'DEVICE_LINKED';
  } catch ({message}) {
    throw new Error(message);
  }
}
// REGISTRAR DISPOSITIVO
async function registerDevice(userId) {
  try {
    const timestamp = await Database.getServerDate();
    // INFORMACION DISPOSITIVO
    const new_device = {
      uniqueId: await getUniqueId(),
      name: await getDeviceName(),
      systemVersion: getSystemVersion(),
      systemName: getSystemName(),
      created:
        Moment(timestamp).format('YYYY-MM-DD') +
        ' ' +
        Moment(timestamp).format('HH:mm:ss'),
      userId,
    };
    // REGISRAMOS EL DISPOSITIVO
    await Database.save(DATABASE_TABLES.REGISTERED_DEVICES, new_device);
  } catch ({message}) {
    throw new Error(message);
  }
}
// OBTENER USUARIO DB
export async function obtenerUsuarioDb() {
  try {
    // OBTENER ESTADO MANTENIMIENTO
    const mantenimiento = await Database.getObject(DATABASE_TABLES.MAINTENANCE);
    // SI LA APP ESTA EN MANTENIMIENTO
    if (mantenimiento.app)
      throw new Error(
        'La aplicación entró en fase de mantenimiento, nuestro equipo de desarrollo se encuentra trabajando en ello.',
      );
    // OBTENER VERSION DE LA APP
    const versiones = await Database.getObject(DATABASE_TABLES.VERSIONS);
    const currentAppVersion = VersionCheck.getCurrentVersion();
    // SI VERSIONES EXISTE EN EL DISPOSITIVO
    if (!Utils.hasLastVersion(currentAppVersion, versiones.app)) {
      throw new Error(ERROR_CODE_NAMES.OUTDATED_APP_VERSION);
    }
    // SI EL USUARIO NO EXISTE EN LOCAL STORAGE
    const usuarioStorage = Storage.getItem('usuario', true);
    if (!usuarioStorage)
      throw new Error(
        'Lo sentimos, no se encontró el usuario en almacenamiento local',
      );
    // SI EL USUARIO EXISTE EN LOCAL
    const usuarioDB = await Database.getItem(
      DATABASE_TABLES.USERS,
      'usuario',
      usuarioStorage.usuario,
    );
    // SI EL USUARIO NO EXISTE
    if (!usuarioDB) throw new Error('Lo sentimos, esta cuenta no existe');
    // VERIFICACION Y VINCULACION DE DISPOSITIVO
    const verificacionMessage = await verifyDeviceRegistration(usuarioDB);
    if (verificacionMessage === 'DEVICE_NOT_LINKED') {
      throw new Error('DEVICE_NOT_LINKED');
    }
    // SI EL USUARIO EXISTE PERO ESTA INACTIVO
    if (!usuarioDB.activo)
      throw new Error(ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT);
    // SI EL USUARIO EXISTE Y ESTA ACTIVO
    // RETORNAMOS EL USUARIO Y VERSION APP
    let newUsuario = {...usuarioDB};
    delete newUsuario.bpassword;
    delete newUsuario.password;
    return newUsuario;
  } catch ({message}) {
    throw new Error(message);
  }
}

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
