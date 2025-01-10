import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar, Text} from 'react-native';
import {Banner, Card} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Content} from '../../../components/Layout';
import {setProductoSeleccionado} from '../../../features/taecel/taecelSlice';
import Campos from './components/Campos';
import ProductoLogo from './components/ProductoLogo';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {Colors} from '../../../utils';
import {useCustomNavigation} from '../../../hooks';
import {TXN} from '../../../constants';

export default function Vender({route}) {
  const {isFocused} = useCustomNavigation();
  const {cargandoCredito} = useSelector(state => state.credito);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setProductoSeleccionado(null));
    };
  }, []);

  if (cargandoCredito) return <LoadingIndicator />;

  return (
    <Container>
      {isFocused && <StatusBar backgroundColor={Colors.blue} />}
      <Content marginBottom={15}>
        <ProductoLogo route={route} />
        <View style={styles.productoBox}>
          <Card style={{backgroundColor: 'white'}}>
            <Card.Content>
              {/* AVISO DE PAGOS EN FIN DE SEMANA */}
              <AvisoPagoServicios route={route} />
              <Campos route={route} />
            </Card.Content>
          </Card>
        </View>
      </Content>
    </Container>
  );
}

function AvisoPagoServicios({route}) {
  const {params} = route;

  if (params.carrier.CategoriaID !== TXN.CODES.SERVICIO) return null;

  return (
    <View
      style={{
        marginBottom: 20,
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 8,
      }}>
      <Text style={{textAlign: 'justify', fontWeight: 'bold'}}>
        Por favor, pague solo recibos vigentes, ya que los vencidos no son
        reconocidos por el sistema y podrían generar cargos adicionales. Los
        pagos se reflejan de 24 a 48 horas hábiles, pero si se realizan en fines
        de semana o días festivos, podrían demorar más. Tiene 48 horas después
        de procesado el pago para reportar cualquier aclaración.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  productoBox: {
    marginTop: 20,
    marginHorizontal: 10,
  },
});
