import React from 'react';
import {StatusBar} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {APP_NAVIGATION} from '../../constants';
import {Colors} from '../../utils';
import ConfiguracionMenu from './ConfiguracionMenu';
import RegistrarImpresora from './RegistrarImpresora';
import CodigoPin from './CodigoPin';
import EstablecerComision from './EstablecerComision';
import Seguridad from './Seguridad';
// NAVIGATION
const Stack = createStackNavigator();

export default function Configuracion() {
  return (
    <>
      <Stack.Navigator
        initialRouteName={APP_NAVIGATION.SCREENS.CONFIG_MENU}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.dark,
          },
          headerTintColor: 'white',
        }}>
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.CONFIG_MENU}
          component={ConfiguracionMenu}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.SEGURIDAD}
          component={Seguridad}
          options={{
            headerTitle: 'Seguridad',
          }}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.REGISTRAR_IMPRESORA}
          component={RegistrarImpresora}
          options={{
            headerTitle: 'Registrar Impresora',
          }}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.CODIGO_PIN}
          component={CodigoPin}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.ESTABLECER_COMISION}
          component={EstablecerComision}
          options={{
            headerTitle: 'Establecer Comisión',
          }}
        />
      </Stack.Navigator>
    </>
  );
}
