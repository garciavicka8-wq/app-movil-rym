import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Storage, Utils} from '../utils';
import {useDispatch} from 'react-redux';
import {
  setCarriers,
  setMainProducts,
  setProducts,
} from '../features/taecel/taecelSlice';

import {cerrarSesionApi} from '../services/auth';
import { Alert, DeviceEventEmitter } from 'react-native';

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Storage.getItem('usuario', true) !== null,
  );
  const dispatch = useDispatch();

  useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('FORCE_LOGOUT', (data) => {
    Alert.alert(
      "Actualización Requerida",
      data.message || "Tu sesión ha expirado debido a una versión antigua.",
      [
        { 
          text: "Aceptar", 
          onPress: () => signout()
        }
      ],
      { cancelable: false }
    );
  });

  return () => {
    // Limpiamos la suscripción al desmontar
    subscription.remove();
  };
}, [signout]);

  const signout = useCallback(async function () {
    try {
      await cerrarSesionApi();
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
  }, [dispatch]);

  const logoutApp = useCallback(async () => {
    await signout();
  }, [signout]);
  
  const checkSession = useCallback(async () => {
    const hasExpired = Utils.hasSessionExpired();
    if (hasExpired) {
      await signout();
      return true;
    }
    return false;
  }, [signout]);

  const value = useMemo(
    () => ({
      setIsAuthenticated,
      signout,
      logoutApp,
      checkSession,
      isAuthenticated,
    }),
    [setIsAuthenticated, signout, logoutApp, checkSession, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
