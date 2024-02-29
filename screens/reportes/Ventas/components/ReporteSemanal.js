import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Moment, Styles as globalStyles} from '../../../../utils';
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
    <>
      <Text style={globalStyles.sectionTitle}>Liquidación</Text>
      {periodos.length > 0 && (
        <Grid>
          {/* <Row>
            <ReporteButton
              label="En curso"
              icon="calendar-month"
              selected={periodos[0].active}
              onPress={() => handleClick(periodos[0], true)}
            />
          </Row> */}
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
          {/* <Row>
            <ReporteButton
              label={Moment(periodos[5].final).format('DD MMM')}
              selected={periodos[5].active}
              onPress={() => handleClick(periodos[5])}
            />
            <ReporteButton
              label={Moment(periodos[6].final).format('DD MMM')}
              selected={periodos[6].active}
              onPress={() => handleClick(periodos[6])}
            />
            <ReporteButton
              label={Moment(periodos[7].final).format('DD MMM')}
              selected={periodos[7].active}
              onPress={() => handleClick(periodos[7])}
            />
            <ReporteButton
              label={Moment(periodos[8].final).format('DD MMM')}
              selected={periodos[8].active}
              onPress={() => handleClick(periodos[8])}
            />
          </Row> */}
        </Grid>
      )}
    </>
  );
}
