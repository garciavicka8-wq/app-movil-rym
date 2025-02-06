import firebase from '../firebase';
import {
  ref,
  get,
  child,
  query,
  orderByChild,
  equalTo,
  set,
  push,
  update as firebaseUpdate,
  serverTimestamp,
  startAt,
  endAt,
  orderByKey,
} from 'firebase/database';

const Database = (() => {
  const DATABASE_REF = ref(firebase.db);
  // GET ITEMS FROM DATABASE
  const getItems = async refName => {
    const snapshot = await get(child(DATABASE_REF, refName));
    let items = [];
    if (snapshot.exists()) {
      snapshot.forEach(item => {
        items.push({...item.val(), key: item.key});
      });
    }
    return items;
  };
  // GET ITEM
  const getItem = async (refName, propName, propVal, filterFnc = undefined) => {
    try {
      const _query = query(
        child(DATABASE_REF, refName),
        orderByChild(propName),
        equalTo(propVal),
      );
      const snapshot = await get(_query);
      let item = null;
      if (snapshot.exists()) {
        snapshot.forEach(el => {
          item = {...el.val(), key: el.key};
        });
      }
      return item;
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // SAVE DATA
  const save = async (refName, data, childKey = null) => {
    try {
      // IF CHILD KEY IS NULL
      if (childKey === null) {
        const itemKey = push(child(DATABASE_REF, refName)).key;
        await set(ref(firebase.db, refName + '/' + itemKey), data);
      }
      // IF CHILD KEY IS NOT NULL
      if (childKey !== null) {
        const _ref = ref(firebase.db, refName + '/' + childKey);
        await firebaseUpdate(_ref, data);
      }
      return true;
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // UPDATE ITEM
  const update = async (refName, childKey, data) => {
    try {
      const _ref = ref(firebase.db, refName + '/' + childKey);
      await firebaseUpdate(_ref, data);
      const updatedItem = await get(
        child(DATABASE_REF, refName + '/' + childKey),
      );
      return {...updatedItem.val(), key: updatedItem.key};
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // DELETE ITEM
  const deleteItem = async (refName, childKey) => {
    await set(ref(firebase.db, refName + '/' + childKey), null);
  };
  // GET ITEMS BY PROP
  const getItemsByProp = async (
    refName,
    propName,
    propVal,
    filterFnc = undefined,
  ) => {
    const _query = query(
      child(DATABASE_REF, refName),
      orderByChild(propName),
      equalTo(propVal),
    );
    const snapshot = await get(_query);
    let items = [];
    if (snapshot.exists()) {
      snapshot.forEach(el => {
        items.push({...el.val(), key: el.key});
      });
    }
    return filterFnc ? items.filter(filterFnc) : items;
  };
  // SERVER DATE
  const getServerDate = async () => {
    const _ref = ref(firebase.db, 'fechaServidor');
    await firebaseUpdate(_ref, {
      date: serverTimestamp(),
    });
    const snapshot = await get(child(DATABASE_REF, 'fechaServidor'));
    return snapshot.val().date;
  };
  // GET OBJECT
  const getObject = async refName => {
    try {
      const snapshot = await get(child(DATABASE_REF, refName));
      return snapshot.exists() ? snapshot.val() : null;
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // GET ITEMS OBJECT
  const getFullObjectInRange = async (
    refName,
    orderBy,
    startDate,
    endDate,
    filterFunction,
    amountProp = undefined,
  ) => {
    const _query = query(
      child(DATABASE_REF, refName),
      orderByChild(orderBy),
      startAt(startDate),
      endAt(endDate),
    );
    const snapshot = await get(_query);
    let items = [];
    // SI NO EXISTE
    if (!snapshot.exists()) return {list: [], total: 0};
    // SI EXISTE
    snapshot.forEach(i => {
      items.push({...i.val(), key: i.key});
    });
    const list = items.filter(filterFunction);
    const total = amountProp
      ? list.reduce((acc, el) => acc + parseInt(el[amountProp]), 0)
      : 0;
    // RETORNAR LISTA DE ITEMS
    return {list, total}; // [{...}, {...}] || []
  };
  // GET ITEMS OBJECT
  const getItemsInRange = async (
    refName,
    orderBy,
    startDate,
    endDate,
    filterFnc = undefined,
  ) => {
    const _query = query(
      child(DATABASE_REF, refName),
      orderByChild(orderBy),
      startAt(startDate),
      endAt(endDate),
    );
    const snapshot = await get(_query);
    let items = [];
    // SI NO EXISTEN
    if (!snapshot.exists()) return [];
    // SI EXISTE
    snapshot.forEach(i => {
      items.push({...i.val(), key: i.key});
    });
    // RETORNAR LISTA DE ITEMS
    return filterFnc ? items.filter(filterFnc) : items; // [{...}, {...}] || []
  };
  // GET ITEM BY KEY
  const getItemByKey = async (refName, childKey) => {
    // const item = await _database.ref(refName).child(childKey).once('value');
    // return item.val() ? {...item.val(), key: item.key} : null;
    const _query = query(
      child(DATABASE_REF, refName),
      orderByKey(),
      equalTo(childKey),
    );
    const snapshot = await get(_query);
    let item = null;
    if (snapshot.exists()) {
      snapshot.forEach(el => {
        item = {...el.val(), key: el.key};
      });
    }
    return item;
  };
  // EXPOSE API
  return {
    getItems,
    getItem,
    getItemsByProp,
    getServerDate,
    getObject,
    getItemsInRange,
    getFullObjectInRange,
    getItemByKey,
    save,
    update,
    deleteItem,
  };
})();

export default Database;
