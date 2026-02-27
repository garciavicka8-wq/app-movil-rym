import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {APP_NAVIGATION} from '../../constants';
import {Colors, Storage} from '../../utils';
import MainScreen from './Main';
// REPORTES SUBPANTALLAS
import Pagos from './Pagos';
import Cancelados from './Cancelados';
import {IconButton} from 'react-native-paper';
import CustomStatusBar from '../../components/CustomStatusBar';
import TicketCancellationRequest from './Main/components/TicketCancellationRequest';

const Stack = createStackNavigator();

export default function TicketsTab() {
  const [appTitle, setAppTitle] = useState('');

  useEffect(() => {
    const obtenerUsuario = () => {
      const usuarioStorage = Storage.getItem('usuario', true);
      if (usuarioStorage) {
        setAppTitle(usuarioStorage.nomComercial);
      }
    };
    obtenerUsuario();
  }, []);

  return (
    <>
      <CustomStatusBar />
      <Stack.Navigator
        initialRouteName={APP_NAVIGATION.SCREENS.TICKETS_MENU}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: 'white',
        }}>
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.TICKETS_MENU}
          component={MainScreen}
          options={({navigation}) => ({
            headerTitle: appTitle,
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
          name={APP_NAVIGATION.SCREENS.PAGOS}
          component={Pagos}
          options={{
            headerTitle: 'Pagos',
          }}
        />
    <Stack.Screen
          name={APP_NAVIGATION.SCREENS.CANCELAR}
          component={Cancelados}
          options={{
            headerTitle: 'Cancelados',
          }}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.CANCELACION_SOLICITUD}
          component={TicketCancellationRequest}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </>
  );
}
