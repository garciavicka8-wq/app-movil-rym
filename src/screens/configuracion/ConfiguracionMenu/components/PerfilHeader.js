import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Helpers, Storage} from '../../../../utils';

export default function PerfilHeader() {
  const [usuario, setUsuario] = useState({usuario: '', nomComercial: ''});
  const [iconText, setIconText] = useState('');

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = () => {
    const _usuario = Storage.getItem('usuario', true);
    setUsuario(_usuario);
    // EXTRAER INICIALES
    const nombre = _usuario.nomComercial || _usuario.agencia || 'Usuario';
    const nombreArray = nombre.split(' ');
    let nombreString = '';
    nombreString =
      nombreArray.length >= 2
        ? Helpers.obtenerPrimerCaracter(nombreArray[0]) +
          Helpers.obtenerPrimerCaracter(nombreArray[1])
        : Helpers.obtenerPrimerCaracter(nombreArray[0]);
    setIconText(nombreString.toUpperCase());
  };

  return (
    <View style={styles.card}>
      <View style={styles.perfilItem}>
        <View style={styles.perfilIcon}>
          <Text style={styles.perfilIconText}>{iconText}</Text>
        </View>
        <View style={styles.perfilBody}>
          <Text style={styles.perfilTitle} numberOfLines={1}>
            {usuario.nomComercial || 'Cargando...'}
          </Text>
          <Text style={styles.perfilText}>{usuario.usuario}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  perfilItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perfilIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  perfilIconText: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '800',
    color: '#0E1321',
  },
  perfilBody: {
    flex: 1,
    paddingLeft: 16,
  },
  perfilTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  perfilText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});
