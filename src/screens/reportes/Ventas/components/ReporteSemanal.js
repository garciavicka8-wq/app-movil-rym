import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Moment} from '../../../../utils';
import {Grid, Row} from 'react-native-easy-grid';
import ReporteButton from './ReporteButton';
import ReporteSemanalLoader from './ReporteSemanalLoader';
import {
  setPeriodoSeleccionado,
  setSemanaEnCurso,
  setTipoEstadoDeCuenta,
} from '../../../../features/tickets/reportes/reportesSlice';
import {useCustomNavigation} from '../../../../hooks';
import {APP_NAVIGATION} from '../../../../constants';

export default function ReporteSemanal() {
  const [cargando, setCargando] = useState(true);
  const {cargandoPeriodos, periodos} = useSelector(state => state.reportes);
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();

  useEffect(() => {
    setCargando(cargandoPeriodos);
  }, [cargandoPeriodos]);

  if (cargando) {
    return <ReporteSemanalLoader />;
  }

  const handleClick = (periodo, semanaEnCurso = false) => {
    dispatch(setSemanaEnCurso(semanaEnCurso));
    dispatch(setTipoEstadoDeCuenta('semanal'));
    dispatch(setPeriodoSeleccionado(periodo));
    navigation.navigate(APP_NAVIGATION.SCREENS.ESTADO_DE_CUENTA);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Liquidación Semanal</Text>
      {periodos.length > 0 && (
        <View style={styles.gridContainer}>
          <Grid>
            <Row>
              <ReporteButton
                label={Moment(periodos[1].final).format('DD MMM')}
                selected={periodos[1].active}
                onPress={() => handleClick(periodos[1])}
              />
              <ReporteButton
                label={Moment(periodos[2].final).format('DD MMM')}
                selected={periodos[2].active}
                onPress={() => handleClick(periodos[2])}
              />
              <ReporteButton
                label={Moment(periodos[3].final).format('DD MMM')}
                selected={periodos[3].active}
                onPress={() => handleClick(periodos[3])}
              />
              <ReporteButton
                label={Moment(periodos[4].final).format('DD MMM')}
                selected={periodos[4].active}
                onPress={() => handleClick(periodos[4])}
              />
            </Row>
          </Grid>
        </View>
      )}
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
