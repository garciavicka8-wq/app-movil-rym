import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Helpers, Storage} from '../../../../utils';
import {Surface} from 'react-native-paper';

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
    const nombre = _usuario.nomComercial || _usuario.agencia;
    const nombreArray = nombre.split(' ');
    let nombreString = '';
    nombreString =
      nombreArray.length >= 2
        ? Helpers.obtenerPrimerCaracter(nombreArray[0]) +
          Helpers.obtenerPrimerCaracter(nombreArray[1])
        : Helpers.obtenerPrimerCaracter(nombreArray[0]);
    setIconText(nombreString);
  };

  return (
    <Surface style={{backgroundColor: 'white', padding: 5, borderRadius: 8}}>
      <View style={styles.perfilItem}>
        <View style={styles.perfilIcon}>
          <Text style={styles.perfilIconText}>{iconText}</Text>
        </View>
        <View style={styles.perfilBody}>
          <Text style={styles.perfilTitle}>{usuario.nomComercial}</Text>
          <Text style={styles.perfilText}>{usuario.usuario}</Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  perfilItem: {
    flexDirection: 'row',
  },
  perfilIcon: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfilIconText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'teal',
  },
  perfilBody: {
    justifyContent: 'center',
    paddingLeft: 15,
    flex: 2,
  },
  perfilRightIcon: {
    justifyContent: 'center',
  },
  perfilTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  perfilText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
