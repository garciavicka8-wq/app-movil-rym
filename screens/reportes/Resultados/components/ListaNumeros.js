import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {uuid} from '../../../../utils';

export default function ListaNumeros() {
  const {cargandoSorteosJugados, cargandoPublicacion, publicacion} =
    useSelector(state => state.ganadores);

  const loadingContent = cargandoSorteosJugados || cargandoPublicacion;

  return (
    <>
      <View style={styles.numerosBox}>
        {loadingContent && (
          <>
            <View style={styles.numeroBox}></View>
            <View style={styles.numeroBox}></View>
          </>
        )}
        {!loadingContent && publicacion && (
          <>
            {publicacion.numeros.map((n, index) => (
              <NumeroGanador key={uuid()} numero={n} posicion={index + 1} />
            ))}
          </>
        )}
      </View>
    </>
  );
}

const NumeroGanador = ({numero, posicion}) => {
  return (
    <View style={styles.numeroBox}>
      <View style={styles.posicionBox}>
        <Text style={styles.posicion}>{posicion}°</Text>
      </View>
      <Text style={styles.numero}>{numero}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  numerosBox: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 20,
  },
  numeroBox: {
    backgroundColor: '#eee',
    width: 80,
    height: 80,
    borderColor: '#EE5E22',
    borderColor: '#eee',
    borderWidth: 3,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    position: 'relative',
  },
  numero: {
    color: '#EE5E22',
    fontSize: 20,
    fontWeight: 'bold',
  },
  posicionBox: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    width: 30,
    height: 30,
    backgroundColor: '#EE5E22',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posicion: {
    color: '#fff',
  },
});
