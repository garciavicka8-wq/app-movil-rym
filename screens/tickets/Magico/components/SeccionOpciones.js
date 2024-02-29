import React, {useEffect} from 'react';
import {useState} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {uuid} from '../../../../utils';
import globalStyles from '../../../../utils/Styles';
import {useDispatch, useSelector} from 'react-redux';
import {
  setCifras,
  setNumeroJugadas,
  setNumeroLugares,
} from '../../../../features/tickets/magico/magicoSlice';

export default function SeccionOpciones() {
  return (
    <>
      <SeccionJugadas />
      <SeccionCifras />
      <SeccionLugares />
    </>
  );
}

function SeccionJugadas() {
  const [botonesJugadas, setBotonesJugadas] = useState([
    {id: uuid(), numero: '1', selected: true},
    {id: uuid(), numero: '2', selected: false},
    {id: uuid(), numero: '3', selected: false},
    {id: uuid(), numero: '4', selected: false},
    {id: uuid(), numero: '5', selected: false},
    {id: uuid(), numero: '6', selected: false},
    {id: uuid(), numero: '7', selected: false},
    {id: uuid(), numero: '8', selected: false},
    {id: uuid(), numero: '9', selected: false},
    {id: uuid(), numero: '10', selected: false},
  ]);
  const dispatch = useDispatch();

  const handlePress = boton => {
    const _botones = botonesJugadas.map(item => ({
      ...item,
      selected: item.numero == boton.numero,
    }));
    dispatch(setNumeroJugadas(boton.numero));
    setBotonesJugadas(_botones);
  };

  return (
    <Section title="Jugadas">
      <View style={styles.botonesJugadasBox}>
        {botonesJugadas.map(item => (
          <BotonJugada
            key={item.id}
            boton={item}
            onPress={() => handlePress(item)}
          />
        ))}
      </View>
    </Section>
  );
}

function SeccionCifras() {
  const [botonesCifras, setBotonesCifras] = useState([
    {id: uuid(), text: 'una cifra', value: '1', selected: false},
    {id: uuid(), text: 'dos cifras', value: '2', selected: false},
    {id: uuid(), text: 'tres cifras', value: '3', selected: true},
  ]);
  const dispatch = useDispatch();

  const handlePress = boton => {
    const _botones = botonesCifras.map(item => ({
      ...item,
      selected: item.value == boton.value,
    }));
    dispatch(setCifras(boton.value));
    setBotonesCifras(_botones);
  };

  return (
    <Section title="Cifras">
      <View style={styles.botonesCapsulaBox}>
        {botonesCifras.map(item => (
          <BotonCifra
            key={item.id}
            boton={item}
            onPress={() => handlePress(item)}
          />
        ))}
      </View>
    </Section>
  );
}

function SeccionLugares() {
  const {sorteoSeleccionado, numeroLugares} = useSelector(
    state => state.magico,
  );
  const [botonesLugares, setBotonesLugares] = useState([
    {id: uuid(), text: '1er', value: '1', selected: true},
    {id: uuid(), text: '2do', value: '2', selected: false},
    {id: uuid(), text: '3er', value: '3', selected: false},
  ]);
  const dispatch = useDispatch();

  useEffect(() => {
    // AL CAMBIAR SORTEO SE REGRESA AL VALOR INICIAL
    setBotonesLugares([
      {id: uuid(), text: '1er', value: '1', selected: true},
      {id: uuid(), text: '2do', value: '2', selected: false},
      {id: uuid(), text: '3er', value: '3', selected: false},
    ]);
    dispatch(setNumeroLugares(['1']));
  }, [sorteoSeleccionado]);

  const handlePress = boton => {
    const _botones = [...botonesLugares];
    _botones.forEach(item => {
      if (item.id === boton.id) {
        item.selected = !boton.selected;
      }
    });
    let _numeroLugares = [];
    _botones.forEach(item => {
      if (item.selected) {
        _numeroLugares.push(item.value);
      }
    });
    console.log(_numeroLugares);
    dispatch(setNumeroLugares(_numeroLugares));
    setBotonesLugares(_botones);
  };

  return (
    <Section title="Lugares">
      <View style={styles.botonesCapsulaBox}>
        {botonesLugares.map((item, index) => {
          if (index < sorteoSeleccionado.numLugares)
            return (
              <BotonLugar
                key={item.id}
                boton={item}
                onPress={() => handlePress(item)}
              />
            );
        })}
      </View>
    </Section>
  );
}

function BotonLugar({boton, onPress}) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={[
          styles.botonCapsula,
          {backgroundColor: boton.selected ? '#03C988' : '#eee'},
        ]}>
        <Text
          style={[styles.botonText, {color: boton.selected ? '#fff' : 'gray'}]}>
          {boton.text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

function BotonCifra({boton, onPress}) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={[
          styles.botonCapsula,
          {backgroundColor: boton.selected ? '#0081C9' : '#eee'},
        ]}>
        <Text
          style={[styles.botonText, {color: boton.selected ? '#fff' : 'gray'}]}>
          {boton.text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

function Section({title, children}) {
  return (
    <View style={{paddingHorizontal: 15}}>
      <Text style={[globalStyles.sectionTitle, {marginVertical: 10}]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function BotonJugada({boton, onPress}) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={[
          styles.botonJugada,
          {backgroundColor: boton.selected ? '#6554AF' : '#eee'},
        ]}>
        <Text
          style={[
            styles.botonText,
            {
              color: boton.selected ? '#fff' : 'gray',
            },
          ]}>
          {boton.numero}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  botonesJugadasBox: {
    width: '100%',
    paddingHorizontal: 10,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  botonJugada: {
    backgroundColor: '#eee',
    borderRadius: 50,
    width: 50,
    height: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  botonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
  botonesCapsulaBox: {
    display: 'flex',
    flexDirection: 'row',
  },
  botonCapsula: {
    backgroundColor: '#eee',
    width: 100,
    height: 40,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
