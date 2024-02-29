import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

export default function ProductoLogo() {
  const {carrierSeleccionado} = useSelector(state => state.taecel);

  return (
    <>
      <View style={styles.logoBox}>
        <Image
          source={{uri: carrierSeleccionado.Logotipo}}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>{carrierSeleccionado.Categoria}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logo: {
    width: 100,
    height: 50,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
