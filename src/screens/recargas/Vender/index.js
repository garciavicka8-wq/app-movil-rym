import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar, Text, Image} from 'react-native';
import {Appbar, Banner, Card} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Content} from '../../../components/Layout';
import {setProductoSeleccionado} from '../../../features/taecel/taecelSlice';
import Campos from './components/Campos';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {Colors} from '../../../utils';
import {useCustomNavigation} from '../../../hooks';
import {TXN} from '../../../constants';
import CustomStatusBar from '../../../components/CustomStatusBar';

export default function Vender({navigation, route}) {
  const {isFocused} = useCustomNavigation();
  const {cargandoCredito} = useSelector(state => state.credito);
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions({headerShown: false});
    return () => {
      dispatch(setProductoSeleccionado(null));
    };
  }, []);

  if (cargandoCredito) return <LoadingIndicator />;

  return (
    <Container bgColor={Colors.lightBackground}>
      {isFocused && <CustomStatusBar color="darkBackground" />}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title={
            <View>
              <Text style={styles.appBarTitle}>{route.params?.carrier?.Nombre || 'Vender'}</Text>
              <Text style={styles.appBarSubtitle}>{route.params?.carrier?.Categoria || 'Recarga'}</Text>
            </View>
          }
        />
        <Image 
          source={{uri: route.params?.carrier?.Logotipo}} 
          style={styles.headerLogo} 
          resizeMode="contain"
        />
      </Appbar.Header>
      <Content marginBottom={15}>
        <View style={styles.productoBox}>
          <Card style={styles.modernCard}>
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
    <View style={styles.warningContainer}>
      <Text style={styles.warningText}>
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
  appBar: {
    backgroundColor: '#0E1321',
    height: 70, // Increased height for title + subtitle
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: 'white',
  },
  appBarSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  headerLogo: {
    width: 60,
    height: 35,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
  productoBox: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  warningContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // pastel amber
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    textAlign: 'justify',
    lineHeight: 18,
  },
});
