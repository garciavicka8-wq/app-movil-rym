import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Colors} from '../../../../utils';

export default function DetallesHeader() {
  const {transaccionStore} = useSelector(state => state.taecel);
  const isSuccess = transaccionStore.Status === 'Exitosa' || transaccionStore.Status === 'SUCCESS';

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          resizeMode="contain"
          style={styles.img}
          source={{uri: transaccionStore.logo}}
        />
      </View>
      
      <View style={[
        styles.statusBadge, 
        {backgroundColor: isSuccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
      ]}>
        <Text style={[
          styles.statusText, 
          {color: isSuccess ? '#15803D' : '#B91C1C'}
        ]}>
          {transaccionStore.Status.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.title}>Comprobante de Pago</Text>
      
      {transaccionStore.Nota !== '' && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            {transaccionStore.Nota}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  img: {
    width: 80,
    height: 80,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 15,
  },
  statusText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 5,
  },
  noteContainer: {
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  noteText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
