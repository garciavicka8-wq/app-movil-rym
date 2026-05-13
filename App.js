import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';
import BleManager from 'react-native-ble-manager';
// PANTALLAS
import Login from './src/screens/login';
import Main from './src/screens/Main';
import JugarTickets from './src/screens/tickets/JugarTickets';
import {APP_NAVIGATION} from './src/constants';
import colors from './src/utils/Colors';
import {Colors} from './src/utils';
import {Alert, DeviceEventEmitter, StatusBar, Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import ConfiguracionMenu from './src/screens/configuracion/ConfiguracionMenu';
import RegistrarImpresora from './src/screens/configuracion/RegistrarImpresora';
import CodigoPin from './src/screens/configuracion/CodigoPin';
import EstablecerComision from './src/screens/configuracion/EstablecerComision';
import Seguridad from './src/screens/configuracion/Seguridad';
import {useAuthContext} from './src/context/AuthContext';
import Notificaciones from './src/screens/notificaciones';
import {NotificationUtils} from './src/utils';
import AppUpdater from './src/components/AppUpdater';
import {Snackbar} from 'react-native-paper';

const Stack = createStackNavigator();

export default function App() {
  const {isAuthenticated} = useAuthContext();
  const [sinInternet, setSinInternet] = useState(false);

  useEffect(() => {
    initApp();
    NotificationUtils.NotificationListener();
    const sub = DeviceEventEmitter.addListener('NO_INTERNET', () => setSinInternet(true));
    return () => sub.remove();
  }, []);

  const initApp = async () => {
    try {
      await BleManager.start();
      SplashScreen.hide();
    } catch ({message}) {
      SplashScreen.hide();
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={{flex: 1}}>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: 'white',
        }}>
        {!isAuthenticated && (
          <>
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.LOGIN}
              component={Login}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
        {isAuthenticated && (
          <>
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.MAIN}
              component={Main}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.JUGAR_TICKETS}
              component={JugarTickets}
              options={{
                headerTitle: 'Ticket Plus',
              }}
            />
            {/* CONFIGURACION */}
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.CONFIG_MENU}
              component={ConfiguracionMenu}
              options={{
                title: 'Configuración',
                headerStyle: {
                  backgroundColor: Colors.dark,
                },
              }}
            />
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.SEGURIDAD}
              component={Seguridad}
              options={{
                title: 'Seguridad',
                headerStyle: {
                  backgroundColor: Colors.dark,
                },
              }}
            />
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.REGISTRAR_IMPRESORA}
              component={RegistrarImpresora}
              options={{
                title: 'Registrar Impresora',
                headerStyle: {
                  backgroundColor: Colors.dark,
                },
              }}
            />
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.CODIGO_PIN}
              component={CodigoPin}
              options={{
                title: 'Código Pin',
                headerStyle: {
                  backgroundColor: Colors.dark,
                },
              }}
            />
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.ESTABLECER_COMISION}
              component={EstablecerComision}
              options={{
                title: 'Establecer Comisión',
                headerStyle: {
                  backgroundColor: Colors.dark,
                },
              }}
            />
            {/* NOTIFICACIONES */}
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.NOTIFICACIONES}
              component={Notificaciones}
              options={{
                title: 'Notificaciones',
                headerStyle: {
                  backgroundColor: Colors.blue,
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
      <AppUpdater />
    </NavigationContainer>
    <Snackbar
      visible={sinInternet}
      onDismiss={() => setSinInternet(false)}
      duration={4000}
      style={{backgroundColor: '#1E293B'}}
      action={{label: 'OK', onPress: () => setSinInternet(false)}}>
      Sin conexión a internet
    </Snackbar>
    </View>
  );
}

const VerificandoAuthScreen = () => {
  return (
    <>
      <StatusBar backgroundColor={colors.darkBlue} />
      <View
        style={{
          display: 'flex',
          flex: 1,
          backgroundColor: Colors.darkBlue,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <IconButton icon="cloud-lock" iconColor="#fff" size={100} />
        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#fff'}}>
          verificando acceso
        </Text>
      </View>
    </>
  );
};
