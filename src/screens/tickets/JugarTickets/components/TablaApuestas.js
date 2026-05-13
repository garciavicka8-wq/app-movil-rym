import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Card} from 'react-native-paper';
import Tabla from './Tabla';
import TablaLoading from './TablaLoading';

export default function TablaApuestas() {
  const [cargando, setCargando] = useState(true);
  const {cargandoProximosSorteos} = useSelector(state => state.jugarTickets);

  useEffect(() => {
    setCargando(cargandoProximosSorteos);
  }, [cargandoProximosSorteos]);

  const cargandoContenido = cargando || cargandoProximosSorteos;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Jugadas en Tabla</Text>
      <Card style={styles.modernCard}>
        <Card.Content style={styles.cardContent}>
          {cargandoContenido && <TablaLoading />}
          {!cargandoContenido && <Tabla />}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    marginLeft: 3,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 10,
  },
  cardContent: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  }
});
