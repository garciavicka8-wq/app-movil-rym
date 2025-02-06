import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

export const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permiso de Almacenamiento',
          message:
            'Esta aplicación necesita acceso al almacenamiento para descargar e instalar actualizaciones.',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso concedido');
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        console.log('Permiso denegado');
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('Permiso denegado permanentemente');
        Alert.alert(
          'Permisos necesarios',
          'Necesitas habilitar los permisos de almacenamiento manualmente desde la configuración.',
          [
            {text: 'Cancelar', style: 'cancel'},
            {
              text: 'Abrir Configuración',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }
};
