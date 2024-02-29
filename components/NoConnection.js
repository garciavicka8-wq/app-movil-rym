import React from 'react';
import {Image, Text, View} from 'react-native';

export default function NoConnection() {
  return (
    <View
      style={{
        display: 'flex',
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        style={{width: 200, height: 200}}
        source={require('../assets/no-internet.jpg')}
        resizeMode="contain"
      />
      <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black'}}>
        ¡Parece que no tienes internet!
      </Text>
      <Text style={{fontSize: 16, color: 'black'}}>Verifica tu conexión</Text>
    </View>
  );
}
