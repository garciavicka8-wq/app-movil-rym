import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

export default function ListaNumeros() {
  const {cargandoSorteosJugados, cargandoPublicacion, publicacion} =
    useSelector(state => state.ganadores);

  const loadingContent = cargandoSorteosJugados || cargandoPublicacion;

  return (
    <View style={styles.container}>
      <View style={styles.numerosBox}>
        {loadingContent ? (
          <>
            <View style={styles.numeroBoxLoader}></View>
            <View style={styles.numeroBoxLoader}></View>
          </>
        ) : (
          publicacion?.numeros?.map((n, index) => (
            <NumeroGanador key={index} numero={n} posicion={index + 1} />
          ))
        )}
      </View>
    </View>
  );
}

const NumeroGanador = ({numero, posicion}) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.numeroBox}>
        <View style={styles.innerCircle}>
          <Text style={styles.numero}>{numero}</Text>
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{posicion}° PREMIO</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  numerosBox: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemContainer: {
    alignItems: 'center',
    margin: 12,
  },
  numeroBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#EE5E22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#FDE6D2',
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EE5E22',
    borderStyle: 'dashed',
  },
  numeroBoxLoader: {
    backgroundColor: '#F1F5F9',
    width: 96,
    height: 96,
    borderRadius: 48,
    margin: 12,
  },
  numero: {
    fontFamily: 'Inter',
    color: '#1E293B',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  labelContainer: {
    marginTop: 10,
    backgroundColor: '#EE5E22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  labelText: {
    fontFamily: 'Inter',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
