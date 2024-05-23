// IMPORTANTE AGREGAR ESTA LINEA PARA QUE UUID4 FUNCIONE
// CORRECTAMENTE
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React from 'react';
import {AppRegistry} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as StoreProvider} from 'react-redux';
import {store} from './app/store';
import App from './App';
import {name as appName} from './app.json';
import {AuthProvider} from './context/AuthContext';

export default function Main() {
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
