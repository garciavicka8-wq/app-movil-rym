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
const bcrypt = require('react-native-bcrypt');
// SI EL EQUIPO ES DE ADMINISTRADOR PUEDE ACCEDER A CUALQUIER CUENTA
// DISPOSITIVOS REGISTRADOS : ID unico del dispositivo, Nombre dispositivo,
export const iniciarSesion = async (numeroUsuario, password, callback) => {
  try {
    const usuarioDB = await Database.getItem(
      DATABASE_TABLES.USERS,
      'usuario',
      numeroUsuario,
    );
    // SI EL USUARIO NO EXISTE
    if (!usuarioDB)
      throw new Error(
        'La cuenta que ingresaste no se encuentra en el sistema.',
      );
    // SI EL USUARIO ESTA DESACTIVADO
    if (usuarioDB.activo !== undefined && !usuarioDB.activo)
      throw new Error(usuarioDB.disableAccountReason);
    // SI EL NUMERO DE INTENTOS DE INICIO DE SESION LLEGO AL LIMITE
    if (usuarioDB.loginAttempts == 3)
      throw new Error(
        'Ha llegado al limite permitido de intentos de inicio de sesión.',
      );
    bcrypt.compare(password, usuarioDB.bpassword, async (err, res) => {
      // VERIFICAMOS SI LA CONTRASEÑA COINCIDE O NO
      if (!res) {
        await Database.update(DATABASE_TABLES.USERS, usuarioDB.key, {
          loginAttempts: parseInt(usuarioDB.loginAttempts) + 1,
        });
        return callback(null, null, {
          message: 'La contraseña es incorrecta',
        });
      }
      // VERIFICACION Y VINCULACION DE DISPOSITIVO
      const verificacionMessage = await verifyDeviceRegistration(usuarioDB);
      // SI EL DISPOSITIVO NO ESTA REGISTRADO NI VINCULADO
      if (verificacionMessage === 'DEVICE_NOT_LINKED') {
        return callback(null, null, {
          message:
            'La cuenta y el dispositivo desde donde intentas acceder no estan vinculados.',
        });
      }
      // SI EL USUARIO Y PASSWORD SON CORRECTOS
      await Database.update(DATABASE_TABLES.USERS, usuarioDB.key, {
        loginAttempts: 0,
        versionAppActualizada: true,
      });
      // OBTENER VERSION DE LA APP
      const versiones = await Database.getObject(DATABASE_TABLES.VERSIONS);
      const currentAppVersion = VersionCheck.getCurrentVersion();
      // SI VERSIONES EXISTE EN EL DISPOSITIVO
      if (!Utils.hasLastVersion(currentAppVersion, versiones.app)) {
        return callback(null, null, {
          message:
            'Tienes una version desactualizada de la app, favor de actualizar.',
          update: true,
        });
      }
      // RETORNAMOS EL USUARIO Y VERSION APP
      let newUsuario = {...usuarioDB};
      delete newUsuario.bpassword;
      delete newUsuario.password;
      callback(newUsuario, versiones.app, null);
    });
  } catch ({message}) {
    throw new Error(message);
  }
};
// VERIFICAR REGISTRO DE DISPOSITIVO
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
// AUTHENTICATE
export const usuarioAutenticado = async (numeroUsuario, password, callback) => {
  try {
    const usuarioDB = await Database.getItem(
      DATABASE_TABLES.USERS,
      'usuario',
      numeroUsuario,
    );
    // SI EL USUARIO NO EXISTE
    if (!usuarioDB)
      throw new Error(
        'La cuenta que ingresaste no se encuentra en el sistema.',
      );
    // SI EL USUARIO ESTA DESACTIVADO
    if (usuarioDB.activo !== undefined && !usuarioDB.activo)
      return callback(false, {
        message: ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT,
      });
    // SI EXISTE EL USUARIO
    bcrypt.compare(password, usuarioDB.bpassword, async (err, res) => {
      // VERIFICAMOS SI LA CONTRASEÑA COINCIDE O NO
      if (!res) {
        return callback(false, {
          message: 'La contraseña es incorrecta',
        });
      }
      // VERIFICACION Y VINCULACION DE DISPOSITIVO
      const verificacionMessage = await verifyDeviceRegistration(usuarioDB);
      if (verificacionMessage === 'DEVICE_NOT_LINKED') {
        return callback(false, {
          message: 'DEVICE_NOT_LINKED',
        });
      }
      // SI NO HAY ERROR ENTONCES EL USUARIO ESTA AUTENTICADO
      callback(true, null);
    });
  } catch ({message}) {
    throw new Error(message);
  }
};
