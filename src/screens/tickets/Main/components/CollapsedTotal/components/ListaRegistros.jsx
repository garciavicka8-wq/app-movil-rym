import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Colors, Moment, Utils} from '../../../../../../utils';
import {useState} from 'react';
import ModalReimpresion from './ModalReimpresion';
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
  const [mostrarModalReimpresion, setMostrarModalReimpresion] = useState(false);
  const TEXTO_HORA = {
    boleto: 'registrado a las ',
    cancelado: 'cancelado a las ',
    pago: 'pagado a las ',
  };

  const handleLongPress = () => {
    if (registro.tipo === 'boleto') {
      navigation.navigate(APP_NAVIGATION.SCREENS.CANCELACION_SOLICITUD, {registro});
    }
  };

  return (
    <>
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
                manten presionado para solicitar cancelacion
              </Text>
            )}
          </View>
          <View>
            <Text
              style={{color: registro.tipo !== 'boleto' ? 'red' : undefined}}>
              {registro.total} pts
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* REIMPRESION MODAL PAUSADO NO FUNCIONA POR EL MOMENTO*/}
      {mostrarModalReimpresion && (
        <ModalReimpresion
          registro={registro}
          onClose={() => setMostrarModalReimpresion(false)}
        />
      )}
    </>
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
