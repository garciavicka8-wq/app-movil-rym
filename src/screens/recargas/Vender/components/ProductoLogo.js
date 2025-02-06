import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

export default function ProductoLogo({route}) {
  const {params} = route;

  return (
    <>
      <View style={styles.logoBox}>
        <Image
          source={{uri: params.carrier.Logotipo}}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>{params.carrier.Categoria}</Text>
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
