import {MMKV} from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';
import RNFS from 'react-native-fs';

const KEYCHAIN_SERVICE = 'com.rymapp2.storage.key';
const STORAGE_ID = 'rym-app-v2';
const STORAGE_ID_LEGACY = 'rym-app-storage';

let appStorage = null;

function generateEncryptionKey() {
  // crypto.getRandomValues disponible en React Native (Hermes/JSC modernos)
  // Fallback a Math.random: la seguridad real viene del Android Keystore, no de la entropía
  try {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    return Array.from({length: 64}, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
  }
}

async function getOrCreateEncryptionKey() {
  try {
    const existing = await Keychain.getGenericPassword({service: KEYCHAIN_SERVICE});
    if (existing) return existing.password;
  } catch (_) {}

  const newKey = generateEncryptionKey();
  await Keychain.setGenericPassword('mmkv', newKey, {service: KEYCHAIN_SERVICE});
  return newKey;
}

// Llamar una vez al inicio de la app antes de cualquier lectura/escritura
export async function initStorage() {
  const encKey = await getOrCreateEncryptionKey();
  const encrypted = new MMKV({id: STORAGE_ID, encryptionKey: encKey});

  // Migración única desde el store legacy sin cifrar.
  // Se verifica la existencia del archivo físico (no las claves) porque clearAll()
  // deja el archivo en disco con bytes legibles; hay que borrarlo explícitamente.
  const legacyBase = `${RNFS.DocumentDirectoryPath}/mmkv/${STORAGE_ID_LEGACY}`;
  const legacyExists = await RNFS.exists(legacyBase);
  if (legacyExists) {
    const legacy = new MMKV({id: STORAGE_ID_LEGACY});
    for (const key of legacy.getAllKeys()) {
      const val = legacy.getString(key);
      if (val !== undefined) {
        encrypted.set(key, val);
      }
    }
    legacy.clearAll();
    await Promise.allSettled([
      RNFS.unlink(legacyBase),
      RNFS.unlink(`${legacyBase}.crc`),
    ]);
  }

  appStorage = encrypted;
}

function getStorage() {
  if (!appStorage) {
    // Fallback de emergencia (no debería ocurrir si initStorage() se llama correctamente)
    return new MMKV({id: STORAGE_ID_LEGACY});
  }
  return appStorage;
}

const Storage = {
  getItem: (key, parseJSON = false) => {
    const item = getStorage().getString(key);
    if (!item) return null;
    if (parseJSON) return JSON.parse(item);
    return item;
  },

  setItem: (key, value, stringfy = false) => {
    if (stringfy) {
      getStorage().set(key, JSON.stringify(value));
      return;
    }
    getStorage().set(key, value);
  },

  removeItem: async key => {
    const item = getStorage().getString(key);
    if (!item) return null;
    getStorage().delete(key);
  },

  getUser: () => {
    const item = getStorage().getString('usuario');
    if (!item) return null;
    return JSON.parse(item);
  },

  updateUser: data => {
    const user = Storage.getUser();
    Storage.setItem('usuario', {...user, ...data}, true);
    return Storage.getUser();
  },
};

export default Storage;
