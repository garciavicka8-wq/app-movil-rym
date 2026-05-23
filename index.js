// IMPORTANTE AGREGAR ESTA LINEA PARA QUE UUID4 FUNCIONE
// CORRECTAMENTE
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, {useEffect, useState} from 'react';
import {AppRegistry} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as StoreProvider} from 'react-redux';
import {store} from './src/app/store';
import App from './App';
import {name as appName} from './app.json';
import {AuthProvider} from './src/context/AuthContext';
import {initStorage} from './src/utils/Storage';

export default function Main() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    initStorage().finally(() => setStorageReady(true));
  }, []);

  if (!storageReady) {
    // SplashScreen nativo cubre la pantalla mientras se inicializa el storage
    return null;
  }

  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PaperProvider>
    </StoreProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
