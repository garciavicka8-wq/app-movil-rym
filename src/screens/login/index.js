import React, {useEffect} from 'react';
import {View, StyleSheet, Image, StatusBar} from 'react-native';
import {useCustomNavigation} from '../../hooks';
import LoginForm from './components/LoginForm';
import {Colors} from '../../utils';
import Ribbon from './components/Ribbon';
const LOGO = require('../../assets/logo.jpg');

export default function Login() {
  const {isFocused} = useCustomNavigation();

  return (
    <>
      {isFocused && <StatusBar backgroundColor={Colors.primary} />}
      <View style={styles.container}>
        <Image
          source={LOGO}
          style={{width: 300, height: 150}}
          resizeMode="contain"
        />
        {/* FORMULARIO */}
        <LoginForm />
        {/* RED RIBBON */}
        <Ribbon />
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
