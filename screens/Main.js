import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// TABS
import RecargasTab from './recargas';
import TicketsTab from './tickets';
import ReportesTab from './reportes';
// CONFIG
import Colors from '../utils/Colors';
// UTILS
import {APP_NAVIGATION} from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useCredito} from '../hooks';

const Tab = createBottomTabNavigator();

export default function Main() {
  const {obtenerCredito} = useCredito();

  useEffect(() => {
    obtenerCredito();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName={APP_NAVIGATION.TABS.RECARGAS}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.blue,
        },
        tabBarInactiveTintColor: 'rgba(255,255,255,0.50)',
        tabBarActiveTintColor: 'white',
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name={APP_NAVIGATION.TABS.RECARGAS}
        // component={TestComponent}
        component={RecargasTab}
        options={{
          title: 'Recargas',
          tabBarIcon: ({focused, color, size}) => {
            let customColor = focused ? 'white' : 'rgba(255,255,255,0.50)';
            return <Icon name="mobile" size={30} color={customColor} />;
          },
        }}
      />
      <Tab.Screen
        name={APP_NAVIGATION.TABS.TICKETS}
        component={TicketsTab}
        options={{
          title: 'Ticket',
          tabBarIcon: ({focused}) => {
            let customColor = focused ? 'white' : 'rgba(255,255,255,0.50)';
            return <Icon name="ticket" size={30} color={customColor} />;
          },
          tabBarStyle: {
            backgroundColor: Colors.primary,
          },
        }}
      />
      <Tab.Screen
        name={APP_NAVIGATION.TABS.REPORTES}
        component={ReportesTab}
        options={{
          title: 'Reportes',
          tabBarIcon: ({focused}) => {
            let customColor = focused ? 'white' : 'rgba(255,255,255,0.50)';
            return <Icon name="calculator" size={30} color={customColor} />;
          },
          tabBarStyle: {
            backgroundColor: Colors.purple,
          },
        }}
      />
    </Tab.Navigator>
  );
}
