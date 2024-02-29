import React, {useState, useEffect} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Colors, Utils} from '../../../utils';
import {getLastTransactions} from '../../../services/taecel';
import UltimaTxnCard from './components/UltimaTxnCard';

export default function UltimosMovimientos() {
  const [cargando, setCargando] = useState(true);
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    obtenerUltimasTransacciones();
  }, []);

  const obtenerUltimasTransacciones = async () => {
    try {
      setCargando(true);
      const hasSessionExpired = await Utils.hasSessionExpired();
      if (!hasSessionExpired) {
        const ultimasTransacciones = await getLastTransactions();
        // console.log(transacciones);
        setTransacciones(ultimasTransacciones);
      }
      setCargando(false);
    } catch ({message}) {
      setCargando(false);
      alert(message);
    }
  };

  if (cargando || transacciones.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimos Movimientos</Text>
      {cargando && <Text>cargando...</Text>}
      {!cargando && (
        <FlatList
          data={transacciones}
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
