import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';
import BleManager from 'react-native-ble-manager';
// PANTALLAS
import Login from './src/screens/login';
import Main from './src/screens/Main';
import JugarTickets from './src/screens/tickets/JugarTickets';
import Magico from './src/screens/tickets/Magico';
import {APP_NAVIGATION} from './src/constants';
import colors from './src/utils/Colors';
import {Colors} from './src/utils';
import {Alert, StatusBar, Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import ConfiguracionMenu from './src/screens/configuracion/ConfiguracionMenu';
import RegistrarImpresora from './src/screens/configuracion/RegistrarImpresora';
import CodigoPin from './src/screens/configuracion/CodigoPin';
import EstablecerComision from './src/screens/configuracion/EstablecerComision';
import Seguridad from './src/screens/configuracion/Seguridad';
import {useAuthContext} from './src/context/AuthContext';
import PagoConTarjeta from './src/screens/PagoConTarjeta';
import TestComponent from './src/screens/TestComponent';

const Stack = createStackNavigator();

export default function App() {
  // useEffect(() => {
  //   SplashScreen.hide();
  // }, []);

  // return <TestComponent />;

  const {isAuthenticated} = useAuthContext();

  useEffect(() => {
    initApp();
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
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: 'white',
        }}>
        {!isAuthenticated && (
          <Stack.Screen
            name={APP_NAVIGATION.SCREENS.LOGIN}
            component={Login}
            options={{
              headerShown: false,
            }}
          />
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
            <Stack.Screen
              name={APP_NAVIGATION.SCREENS.MAGICO}
              component={Magico}
              options={{
                headerTitle: 'Ticket Mágico',
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
