import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

export default function DetallesHeader() {
  const {transaccionStore} = useSelector(state => state.taecel);

  return (
    <>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Image
          resizeMode="contain"
          style={styles.img}
          source={{uri: transaccionStore.logo}}
        />
      </View>
      <Text style={styles.titulo}>
        Transacción{' '}
        <Text
          style={{
            color: transaccionStore.Status == 'Exitosa' ? 'green' : 'red',
          }}>
          {transaccionStore.Status}
        </Text>
      </Text>
      {transaccionStore.Nota !== '' && (
        <Text style={{textAlign: 'center', color: 'red', fontStyle: 'italic'}}>
          {transaccionStore.Nota}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tituloBox: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 30,
    paddingVertical: 15,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  img: {
    width: 100,
    height: 100,
  },
});
