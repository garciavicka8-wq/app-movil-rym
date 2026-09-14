import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Colors, Moment, Utils} from '../../../../../../utils';
import {useNavigation} from '@react-navigation/native';
import {APP_NAVIGATION} from '../../../../../../constants';

const {useSelector} = require('react-redux');

export default function ListaRegistros() {
  const {registrosAlMomento} = useSelector(state => state.cliente);

  return (
    <View>
      {registrosAlMomento.length > 0 && (
        <Text style={{textAlign: 'center', fontSize: 18, marginVertical: 5}}>
          {Moment(registrosAlMomento[0].fecha).format('ddd DD MMMM YYYY')}
        </Text>
      )}
      <ScrollView style={{maxHeight: 250}}>
        {registrosAlMomento.map(registro => (
          <RegistroItem key={registro.id} registro={registro} />
        ))}
      </ScrollView>
    </View>
  );
}

function RegistroItem({registro}) {
  const navigation = useNavigation();
  const TEXTO_HORA = {
    boleto: 'registrado a las ',
    cancelado: 'cancelado a las ',
    pago: 'pagado a las ',
  };

  const handleLongPress = () => {
    if (registro.tipo !== 'boleto') return;

    // Alert de selección deshabilitado temporalmente — al quitarse "Solicitar cancelación"
    // (código conservado más abajo), la única acción disponible era "Reimprimir", así que
    // se manda directo a esa pantalla sin mostrar el prompt.
    // Alert.alert('Boleto', '¿Qué deseas hacer?', [
    //   {
    //     text: 'Solicitar cancelación',
    //     onPress: () =>
    //       navigation.navigate(APP_NAVIGATION.SCREENS.CANCELACION_SOLICITUD, {
    //         registro,
    //       }),
    //   },
    //   {
    //     text: 'Reimprimir',
    //     onPress: () =>
    //       navigation.navigate(APP_NAVIGATION.SCREENS.REIMPRIMIR, {registro}),
    //   },
    // ]);
    navigation.navigate(APP_NAVIGATION.SCREENS.REIMPRIMIR, {registro});
  };

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <View style={styles.registroItem}>
        <View>
          <Text>{Utils.shortenID(registro.numeroBoleto)}</Text>
          <Text style={{fontSize: 12}}>
            {TEXTO_HORA[registro.tipo]} {registro.hora}
          </Text>
          {registro.tipo === 'boleto' && (
            <Text
              style={{
                color: Colors.darkBlue,
                fontStyle: 'italic',
                fontSize: 12,
                fontWeight: 'bold',
              }}>
              manten presionado para reimprimir
            </Text>
          )}
        </View>
        <View>
          <Text style={{color: registro.tipo !== 'boleto' ? 'red' : undefined}}>
            {registro.total} pts
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  registroItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
});
