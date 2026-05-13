import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Grid, Row} from 'react-native-easy-grid';
import {useCustomNavigation} from '../../../../hooks';
// LOCAL COMPONENTS
import ReporteButton from './ReporteButton';
import ReporteDiarioLoader from './ReporteDiarioLoader';
// STORE ACTIONS
import {
  setPeriodoSeleccionado,
  setSemanaEnCurso,
  setTipoEstadoDeCuenta,
} from '../../../../features/tickets/reportes/reportesSlice';
import {APP_NAVIGATION} from '../../../../constants';

export default function ReporteDiario() {
  const [cargando, setCargando] = useState(true);
  const {cargandoPeriodos, dias} = useSelector(state => state.reportes);
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();

  useEffect(() => {
    setCargando(cargandoPeriodos);
  }, [cargandoPeriodos]);

  if (cargando) {
    return <ReporteDiarioLoader />;
  }

  const handleClick = async dia => {
    dispatch(setSemanaEnCurso(false));
    dispatch(setTipoEstadoDeCuenta('diario'));
    dispatch(setPeriodoSeleccionado(dia));
    navigation.navigate(APP_NAVIGATION.SCREENS.ESTADO_DE_CUENTA);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Reporte Diario</Text>
      <View style={styles.gridContainer}>
        <Grid>
          <Row>
            <ReporteButton
              onPress={() => handleClick(dias[0])}
              label={dias[0].nombre}
            />
            <ReporteButton
              onPress={() => handleClick(dias[1])}
              label={dias[1].nombre}
            />
            <ReporteButton
              onPress={() => handleClick(dias[2])}
              label={dias[2].nombre}
            />
            <ReporteButton
              onPress={() => handleClick(dias[3])}
              label={dias[3].nombre}
            />
          </Row>
          <Row>
            <ReporteButton
              onPress={() => handleClick(dias[4])}
              label={dias[4].nombre}
            />
            <ReporteButton
              onPress={() => handleClick(dias[5])}
              label={dias[5].nombre}
            />
            <ReporteButton
              onPress={() => handleClick(dias[6])}
              label={dias[6].nombre}
            />
            <ReporteButton
              onPress={() => handleClick(dias[7])}
              label={dias[7].nombre}
            />
          </Row>
          <Row>
            <ReporteButton
              label="Semanas Anteriores"
              icon="calendar-month"
              onPress={() => handleClick({active: false, nombre: 'semanal'})}
            />
          </Row>
        </Grid>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 15,
    marginLeft: 5,
  },
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
