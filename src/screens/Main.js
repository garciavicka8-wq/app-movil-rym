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
import {useDispatch} from 'react-redux';
import {initEcho, disconnectEcho} from '../utils/EchoClient';
import {Storage} from '../utils';
import {incrementUnreadCount, setUnreadCount} from '../features/notifications/notificationsSlice';
import axios from 'axios';
import {RYM_API_URL} from '../constants';

const Tab = createBottomTabNavigator();

export default function Main() {
  const {obtenerCreditoApi} = useCredito();
  const dispatch = useDispatch();

  useEffect(() => {
    obtenerCreditoApi();

    const fetchInitialUnreadCount = async (user) => {
      try {
        const {data} = await axios.get(`${RYM_API_URL}/notifications/unread-count`, {
          headers: {Authorization: `Bearer ${user.token}`}
        });
        if (data && data.unread_count !== undefined) {
          dispatch(setUnreadCount(data.unread_count));
        }
      } catch (err) {
        console.log("Error consultando count notificaciones initial:", err);
      }
    };

    // Inicializar Laravel Echo y conteo
    const user = Storage.getUser();
    let echoInstance = null;

    if (user && user.id) {
      fetchInitialUnreadCount(user);
      echoInstance = initEcho();
      if (echoInstance) {
        // Escuchar al canal privado del usuario
        // Al usar broadcastAs() en Laravel, Echo necesita un punto initial ('.') para saltarse el namespace implicito de App\\Events
        echoInstance.private(`App.Models.User.${user.id}`)
          .listen('.notification.received', (notification) => {
            console.log("!!! Notificación recibida en tiempo real !!! ", notification);
            dispatch(incrementUnreadCount());
          });
      }
    }

    return () => {
      disconnectEcho(echoInstance);
    };
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
