import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {APP_NAVIGATION} from '../../constants';
import {useLogout} from '../../hooks';
import Colors from '../../utils/Colors';
import MainScreen from './Main';
import SeleccionarComp from './SeleccionarComp';
import {Storage} from '../../utils';
import Transacciones from './Transacciones';
import {IconButton} from 'react-native-paper';
import DetalleTransaccion from './DetalleTransaccion';
import Vender from './Vender';
import CustomStatusBar from '../../components/CustomStatusBar';
// NAVIGATION
const Stack = createStackNavigator();

export default function Recargas() {
  const [appTitle, setAppTitle] = useState('Bienvenido');
  const {logout} = useLogout();

  useEffect(() => {
    const comprobarUsuario = async () => {
      const usuarioStorage = Storage.getItem('usuario', true);
      if (usuarioStorage) {
        setAppTitle(usuarioStorage.nomComercial);
      } else {
        logout();
      }
    };
    comprobarUsuario();
  }, []);

  return (
    <>
      <CustomStatusBar color={'blue'} />
      <Stack.Navigator
        initialRouteName={APP_NAVIGATION.SCREENS.RECARGAS_MENU}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.blue,
          },
          headerTintColor: 'white',
        }}>
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.RECARGAS_MENU}
          component={MainScreen}
          options={({navigation}) => ({
            headerTitle: appTitle,
            headerLeft: null,
            headerRight: () => (
              <IconButton
                icon="cog"
                iconColor="white"
                onPress={() =>
                  navigation.navigate(APP_NAVIGATION.SCREENS.CONFIG_MENU)
                }
              />
            ),
          })}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.SELECCIONAR_COMP}
          component={SeleccionarComp}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name={APP_NAVIGATION.SCREENS.VENDER} component={Vender} />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.TRANSACCIONES}
          component={Transacciones}
          options={{
            headerTitle: 'Transacciones',
          }}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION}
          component={DetalleTransaccion}
          options={({navigation}) => ({
            headerTitle: 'Detalle transacción',
            headerLeft: () => (
              <IconButton
                icon="close"
                iconColor="white"
                onPress={() => {
                  navigation.goBack();
                }}
              />
            ),
          })}
        />
      </Stack.Navigator>
    </>
  );
}
