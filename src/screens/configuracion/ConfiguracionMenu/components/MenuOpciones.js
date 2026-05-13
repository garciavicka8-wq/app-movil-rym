import React from 'react';
import {StyleSheet, View} from 'react-native';
import {APP_NAVIGATION} from '../../../../constants';
import {useCustomNavigation} from '../../../../hooks';
import LogoutButton from './LogoutButton';
import MenuOpcion from './MenuOpcion';

export default function MenuOpciones() {
  const navigation = useCustomNavigation();

  const handleNavigate = screenName => {
    navigation.navigate(APP_NAVIGATION.SCREENS[screenName]);
  };

  return (
    <View style={styles.card}>
      <MenuOpcion
        label="Seguridad"
        leftIcon="key"
        rightIcon="chevron-right"
        onPress={() => handleNavigate('SEGURIDAD')}
      />
      <View style={styles.divider} />
      <MenuOpcion
        label="Registrar Impresora"
        leftIcon="printer"
        rightIcon="chevron-right"
        onPress={() => handleNavigate('REGISTRAR_IMPRESORA')}
      />
      <View style={styles.divider} />
      <MenuOpcion
        label="Código PIN"
        leftIcon="lock"
        rightIcon="chevron-right"
        onPress={() => handleNavigate('CODIGO_PIN')}
      />
      <View style={styles.divider} />
      <MenuOpcion
        label="Comisión Recargas"
        leftIcon="account-cash"
        rightIcon="chevron-right"
        onPress={() => handleNavigate('ESTABLECER_COMISION')}
      />
      <View style={styles.divider} />
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
});
