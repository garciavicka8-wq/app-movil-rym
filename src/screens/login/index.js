import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import LoginForm from './components/LoginForm';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function Login() {
  return (
    <>
      <CustomStatusBar color="darkBackground" />
      <View style={styles.container}>
        <LoginForm />

        <Text style={styles.footerText}>LOGIN</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#0E1321',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    color: '#4B5565',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});
