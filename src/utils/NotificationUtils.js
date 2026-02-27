import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus
} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

const NotificationUtils = {
  // Solicitar permisos (Android 13+ y iOS)
  requestUserPermission: async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso de notificaciones concedido');
        return true;
      } else {
        console.log('Permiso de notificaciones denegado');
        return false;
      }
    } else {
      const messagingInstance = getMessaging();
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
      return enabled;
    }
  },

  // Obtener el token FCM del dispositivo
  getFCMToken: async () => {
    try {
      const messagingInstance = getMessaging();
      const token = await getToken(messagingInstance);
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.log('Error obteniendo token FCM:', error);
      return null;
    }
  },

  // Configurar listeners para notificaciones
  NotificationListener: () => {
    const messagingInstance = getMessaging();

    // Cuando la app está abierta (foreground)
    onMessage(messagingInstance, async remoteMessage => {
      console.log('Notificación en primer plano:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || 'Notificación',
        remoteMessage.notification?.body || 'Tienes un nuevo mensaje',
      );
    });

    // Cuando la app se abre desde una notificación en background
    onNotificationOpenedApp(messagingInstance, remoteMessage => {
      console.log(
        'Notificación causó apertura desde background:',
        remoteMessage.notification,
      );
    });

    // Cuando la app se abre desde un estado cerrado (quit)
    getInitialNotification(messagingInstance)
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notificación causó apertura desde estado cerrado:',
            remoteMessage.notification,
          );
        }
      });
  },
};

export default NotificationUtils;
