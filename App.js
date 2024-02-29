import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';
import BleManager from 'react-native-ble-manager';
// PANTALLAS
import Login from './screens/login';
import Main from './screens/Main';
import JugarTickets from './screens/tickets/JugarTickets';
import Magico from './screens/tickets/Magico';
import {APP_NAVIGATION} from './constants';
import colors from './utils/Colors';
import {Colors, Storage} from './utils';
import {StatusBar, Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setIsUserLoggedIn, setVerifyingUser} from './features/auth/authSlice';
import ConfiguracionMenu from './screens/configuracion/ConfiguracionMenu';
import RegistrarImpresora from './screens/configuracion/RegistrarImpresora';
import CodigoPin from './screens/configuracion/CodigoPin';
import EstablecerComision from './screens/configuracion/EstablecerComision';
import Seguridad from './screens/configuracion/Seguridad';

const Stack = createStackNavigator();

export default function App() {
  const {verifyingUser, isUserLoggedIn} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    dispatch(setVerifyingUser(true));
    await BleManager.start();
    SplashScreen.hide();
    if (Storage.getItem('usuario')) {
      setTimeout(() => {
        dispatch(setIsUserLoggedIn(true));
        dispatch(setVerifyingUser(false));
      }, 300);
    } else {
      setTimeout(() => {
        dispatch(setIsUserLoggedIn(false));
        dispatch(setVerifyingUser(false));
      }, 300);
    }
  };

  if (verifyingUser) return <VerificandoAuthScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: 'white',
        }}>
        {!isUserLoggedIn && (
          <Stack.Screen
            name={APP_NAVIGATION.SCREENS.LOGIN}
            component={Login}
            options={{
              headerShown: false,
            }}
          />
        )}
        {isUserLoggedIn && (
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
