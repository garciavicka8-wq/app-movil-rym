import React from 'react';
import {StyleSheet, Text, View, StatusBar} from 'react-native';
import {IconButton} from 'react-native-paper';
import Colors from '../utils/Colors';

const THREATS = {
  root: {
    icon: 'shield-remove',
    title: 'Dispositivo no compatible',
    message:
      'Tu dispositivo tiene acceso root activo. Por seguridad, esta aplicación no puede ejecutarse en dispositivos modificados o desbloqueados.',
  },
  emulator: {
    icon: 'monitor-off',
    title: 'Entorno no permitido',
    message:
      'Se detectó que la aplicación está ejecutándose en un emulador. Esta aplicación solo puede usarse en dispositivos físicos.',
  },
};

export default function SecurityBlockScreen({threat}) {
  const config = THREATS[threat] ?? THREATS.root;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.darkBlue} barStyle="light-content" />
      <IconButton icon={config.icon} iconColor={Colors.primary} size={80} />
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>
      <Text style={styles.code}>Código: SEC-{threat?.toUpperCase()}-01</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  code: {
    position: 'absolute',
    bottom: 32,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
