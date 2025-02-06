import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {Storage, Utils} from '../utils';
import {useDispatch} from 'react-redux';
import {
  setCarriers,
  setMainProducts,
  setProducts,
} from '../features/taecel/taecelSlice';

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Storage.getItem('usuario', true) !== null,
  );
  const dispatch = useDispatch();

  const signout = useCallback(async function () {
    try {
      Storage.removeItem('usuario');
      Storage.removeItem('versionApp');
      Utils.removeLoginTime();
      dispatch(setMainProducts([]));
      dispatch(setCarriers([]));
      dispatch(setProducts([]));
      setIsAuthenticated(false);
    } catch ({message}) {
      Storage.removeItem('usuario');
      Storage.removeItem('versionApp');
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      setIsAuthenticated,
      signout,
      isAuthenticated,
    }),
    [setIsAuthenticated, signout, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
