import {MMKV} from 'react-native-mmkv';

const appStorage = new MMKV({
  id: 'rym-app-storage',
});

const Storage = {
  // NEW API FOR LOCAL STORAGE
  getItem: (key, parseJSON = false) => {
    const item = appStorage.getString(key);
    if (!item) return null;
    if (parseJSON) return JSON.parse(item);
    return item;
  },

  setItem: (key, value, stringfy = false) => {
    if (stringfy) {
      appStorage.set(key, JSON.stringify(value));
      return;
    }
    appStorage.set(key, value);
  },

  removeItem: async key => {
    const item = appStorage.getString(key);
    if (!item) return null;
    appStorage.delete(key);
  },

  getUser: () => {
    const item = appStorage.getString('usuario');
    if (!item) return null;
    return JSON.parse(item);
  },

  updateUser: (data) => {
    const user = Storage.getUser();
    Storage.setItem('usuario', {...user, ...data}, true);
    return Storage.getUser();
  },

};

export default Storage;
