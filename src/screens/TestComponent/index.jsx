import {useState} from 'react';
import {Alert, View} from 'react-native';
import {Button} from 'react-native-paper';
import {notifyAdmins} from '../../services/notifications';
import {Storage} from '../../utils';

export default function TestComponent() {
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    setSending(true);
    try {
      const usuario = Storage.getUser();
      const res = await notifyAdmins(
        'Comprobante Liquidacion',
        `El usuario ${usuario.usuario} subio un comprobante de pago`,
      );
      setSending(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.message);
      setSending(false);
    }
  };

  return (
    <View
      style={{
        display: 'flex',
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Button mode="contained" disabled={sending} onPress={sendNotification}>
        Enviar Notificación
      </Button>
    </View>
  );
}
