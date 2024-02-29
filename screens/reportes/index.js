import React from 'react';
import {StatusBar} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {APP_NAVIGATION} from '../../constants';
import {useCustomNavigation} from '../../hooks';
import {Colors} from '../../utils';
import MainScreen from './Main';
import VentasScreen from './Ventas';
import ResultadosScreen from './Resultados';
import EstadoDeCuenta from './Ventas/EstadoDeCuenta';
import {IconButton} from 'react-native-paper';
// NAVIGATION
const Stack = createStackNavigator();

export default function ReportesTab() {
  const {isFocused} = useCustomNavigation();

  return (
    <>
      {isFocused && <StatusBar backgroundColor={Colors.purple} />}
      <Stack.Navigator
        initialRouteName={APP_NAVIGATION.SCREENS.REPORTES_MENU}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.purple,
          },
          headerTintColor: 'white',
        }}>
        <Stack.Screen
          name="Reportes"
          component={MainScreen}
          options={({navigation}) => ({
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
        <Stack.Screen name="Ventas" component={VentasScreen} />
        <Stack.Screen
          name="NumerosGanadores"
          component={ResultadosScreen}
          options={{title: 'Resultados'}}
        />
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.ESTADO_DE_CUENTA}
          component={EstadoDeCuenta}
          options={{
            headerTitle: '',
          }}
        />
      </Stack.Navigator>
    </>
  );
}
