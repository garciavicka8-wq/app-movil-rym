import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {APP_NAVIGATION} from '../../constants';
import {Colors} from '../../utils';
import MainScreen from './Main';
import VentasScreen from './Ventas';
import ResultadosScreen from './Resultados';
import ComprobantesScreen from './Comprobantes';
import EstadoDeCuenta from './Ventas/EstadoDeCuenta';
import {IconButton} from 'react-native-paper';
import CustomStatusBar from '../../components/CustomStatusBar';
import NotificationBell from '../../components/NotificationBell';
import {View} from 'react-native';
// NAVIGATION
const Stack = createStackNavigator();

export default function ReportesTab() {
  return (
    <>
      <CustomStatusBar color={'darkBackground'} />
      <Stack.Navigator
        initialRouteName={APP_NAVIGATION.SCREENS.REPORTES_MENU}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.darkBackground,
          },
          headerTintColor: 'white',
        }}>
        <Stack.Screen
          name="Reportes"
          component={MainScreen}
          options={({navigation}) => ({
            headerRight: () => (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <NotificationBell />
                <IconButton
                  icon="cog"
                  iconColor="white"
                  onPress={() =>
                    navigation.navigate(APP_NAVIGATION.SCREENS.CONFIG_MENU)
                  }
                />
              </View>
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
        <Stack.Screen
          name={APP_NAVIGATION.SCREENS.COMPROBANTES}
          component={ComprobantesScreen}
          options={{
            title: 'Comprobantes',
          }}
        />
      </Stack.Navigator>
    </>
  );
}
