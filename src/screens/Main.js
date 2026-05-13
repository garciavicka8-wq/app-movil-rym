import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
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
    <View style={{flex: 1, backgroundColor: Colors.darkBackground}}>
      <Tab.Navigator
        initialRouteName={APP_NAVIGATION.TABS.RECARGAS}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            height: 70,
            elevation: 0,
            shadowOpacity: 0,
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 'bold',
            marginBottom: 10,
          },
          tabBarInactiveTintColor: '#94A3B8',
          tabBarActiveTintColor: Colors.primary,
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}>
        <Tab.Screen
          name={APP_NAVIGATION.TABS.RECARGAS}
          component={RecargasTab}
          options={{
            title: 'Recargas',
            tabBarIcon: ({focused}) => (
              <View style={[
                {
                  width: 36, 
                  height: 36, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  borderRadius: 10, 
                  marginTop: 5
                },
                focused ? {backgroundColor: 'rgba(199, 44, 51, 0.1)'} : {}
              ]}>
                <Icon name="mobile" size={24} color={focused ? Colors.dark : '#94A3B8'} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name={APP_NAVIGATION.TABS.TICKETS}
          component={TicketsTab}
          options={{
            title: 'Ticket',
            tabBarIcon: ({focused}) => (
              <View style={{marginTop: 5}}>
                <Icon name="ticket" size={20} color={focused ? Colors.dark : '#94A3B8'} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name={APP_NAVIGATION.TABS.REPORTES}
          component={ReportesTab}
          options={{
            title: 'Reportes',
            tabBarIcon: ({focused}) => (
              <View style={{marginTop: 5}}>
                <Icon name="bar-chart" size={20} color={focused ? Colors.dark : '#94A3B8'} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
