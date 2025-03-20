import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import LoginForm from './components/LoginForm';
import Ribbon from './components/Ribbon';
import CustomStatusBar from '../../components/CustomStatusBar';
const LOGO = require('../../assets/logo.jpg');

export default function Login() {
  return (
    <>
      <CustomStatusBar />
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
