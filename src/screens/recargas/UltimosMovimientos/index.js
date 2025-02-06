import React, {useState, useEffect} from 'react';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import {Colors, Storage, Utils} from '../../../utils';
import {getLastTransactions} from '../../../services/taecel';
import UltimaTxnCard from './components/UltimaTxnCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  setTransaccionStore,
  setUltimasTransacciones,
} from '../../../features/taecel/taecelSlice';
import {APP_NAVIGATION, TRANSACTION_STATES} from '../../../constants';
import {useCustomNavigation} from '../../../hooks';

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
        const _ultimasTransacciones = await getLastTransactions();
        dispatch(setUltimasTransacciones(_ultimasTransacciones));
      }
      setCargando(false);
    } catch ({message}) {
      setCargando(false);
      Alert.alert('Error', message);
    }
  };

  const verifyTransactionsStatus = () => {
    if (ultimasTransacciones.lenth === 0) return;
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

  if (cargando || ultimasTransacciones.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimos Movimientos</Text>
      {cargando && <Text>cargando...</Text>}
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
