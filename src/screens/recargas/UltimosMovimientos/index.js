import React, {useState, useEffect} from 'react';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import {Colors, Utils} from '../../../utils';
import {getLastTransactionsApi} from '../../../services/taecel';
import UltimaTxnCard from './components/UltimaTxnCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  setTransaccionStore,
  setUltimasTransacciones,
} from '../../../features/taecel/taecelSlice';
import {APP_NAVIGATION, TRANSACTION_STATES} from '../../../constants';
import {useCustomNavigation} from '../../../hooks';
import UltimosMovimientosSkeleton from './components/UltimosMovimientosSkeleton';

export default function UltimosMovimientos() {
  const [cargando, setCargando] = useState(true);
  const dispatch = useDispatch();
  const {ultimasTransacciones} = useSelector(state => state.taecel);
  const navigation = useCustomNavigation();

  useEffect(() => {
    obtenerUltimasTransacciones();
  }, []);

  useEffect(() => {
    verifyTransactionsStatus();
  }, [ultimasTransacciones]);

  const obtenerUltimasTransacciones = async () => {
    try {
      setCargando(true);
      const hasSessionExpired = Utils.hasSessionExpired();
      if (!hasSessionExpired) {
        const _ultimasTransacciones = await getLastTransactionsApi();
        dispatch(setUltimasTransacciones(_ultimasTransacciones));
      }
      setCargando(false);
    } catch (error) {
      setCargando(false);
      Alert.alert('Error', error.message || 'Error desconocido');
    }
  };

  const verifyTransactionsStatus = () => {
    if (ultimasTransacciones.length === 0) return;
    for (let i = 0; i < ultimasTransacciones.length; i++) {
      const txn = ultimasTransacciones[i];
      // console.log(txn.Status, txn.Fecha, txn.Monto);
      if ([TRANSACTION_STATES.PROCESSING].includes(txn.Status)) {
        Alert.alert(
          'Importante',
          'el estado de una de sus transacciónes esta en PROCESO favor de ir al Detalle de la transacción para verifcar si ya se ha procesado',
          [
            {
              text: 'Detalle transacción',
              onPress: () => {
                dispatch(setTransaccionStore(txn));
                navigation.navigate(APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION);
              },
            },
          ],
        );
        break;
      }
    }
  };

  // No retornamos null para que el título siempre se vea o permitimos que el esqueleto se encargue
  // Si no hay transacciones, mostramos un mensaje o nada, pero permitimos que el componente renderice para ver el log
  if (ultimasTransacciones.length === 0 && !cargando) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Últimos Movimientos</Text>
        <Text>No se encontraron movimientos recientes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimos Movimientos</Text>
      {cargando && <UltimosMovimientosSkeleton />}
      {!cargando && (
        <FlatList
          data={ultimasTransacciones}
          renderItem={({item}) => <UltimaTxnCard txn={item} />}
          keyExtractor={item => item.TransID}
          horizontal
        />
      )}
      {/* {!cargando && (
        <>
          {transacciones.map(txn => (
            <UltimaTxnCard txn={txn} key={txn.TransID} />
          ))}
        </>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '700',
    color: Colors.darkBlue,
    marginBottom: 20,
  },
  container: {
    marginBottom: 10,
    paddingHorizontal: 15,
  },
});
