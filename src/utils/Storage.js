import {MMKV} from 'react-native-mmkv';

const appStorage = new MMKV({
  id: 'rym-app-storage',
});

const Storage = (() => {
  // NEW API FOR LOCAL STORAGE
  const getItem = (key, parseJSON = false) => {
    const item = appStorage.getString(key);
    if (!item) return null;
    if (parseJSON) return JSON.parse(item);
    return item;
  };
  const setItem = (key, value, stringfy = false) => {
    if (stringfy) {
      appStorage.set(key, JSON.stringify(value));
      return;
    }
    appStorage.set(key, value);
  };
  const removeItem = async key => {
    const item = appStorage.getString(key);
    if (!item) return null;
    appStorage.delete(key);
  };
  const getUser = () => {
    const item = appStorage.getString('usuario');
    if (!item) return null;
    return JSON.parse(item);
  };
  //  EXPOSE API
  return {
    getItem,
    setItem,
    removeItem,
    getUser,
  };
})();

export default Storage;
