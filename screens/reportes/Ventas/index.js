import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import Database from '../../../database';
import {
  resetBotonesReporte,
  setCargandoPeriodos,
  setPeriodos,
} from '../../../features/tickets/reportes/reportesSlice';
import {Moment, Styles as globalStyles, uuid} from '../../../utils';
import {Container, Content} from '../../../components/Layout';
import ReporteSemanal from './components/ReporteSemanal';
import ReporteDiario from './components/ReporteDiario';
import {obtenerUsuarioDb} from '../../../services/auth';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useLogout} from '../../../hooks';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';

export default function Ventas() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cargarBotones();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    return () => {
      dispatch(resetBotonesReporte());
    };
  }, []);

  const cargarBotones = async () => {
    try {
      dispatch(setCargandoPeriodos(true));
      const semanas = await obtenerFechas();
      dispatch(setPeriodos(semanas));
      dispatch(setCargandoPeriodos(false));
    } catch ({message}) {
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      Alert.alert('Mensaje', message);
    }
  };

  const obtenerFechas = async () => {
    try {
      await obtenerUsuarioDb();
      const timestamp = await Database.getServerDate();
      const semanas = [];
      for (let i = 0; i < 9; i++) {
        const periodo = obtenerPeriodo(timestamp, i);
        const fecha = {
          id: uuid(),
          inicial: periodo[0],
          final: periodo[periodo.length - 1],
          active: false,
        };
        semanas.push(fecha);
      }
      return semanas;
    } catch ({message}) {
      throw new Error(message);
    }
  };

  const obtenerPeriodo = (timestamp, semanaID) => {
    let ocurrencies = 9;
    let ocurrenciesCounter = 0;
    let counter = 0;
    let dias_lunes = [];
    // OBTENEMOS SOLO LOS DIAS LUNES
    while (ocurrenciesCounter !== ocurrencies) {
      if (
        Moment(timestamp)
          .subtract(counter, 'days')
          .format('dddd')
          .toLowerCase() === 'lunes'
      ) {
        dias_lunes.push(
          Moment(timestamp).subtract(counter, 'days').format('YYYY-MM-DD'),
        );
        ocurrenciesCounter++;
      }
      counter++;
    }
    // FECHAS FINALES
    const fechasFinales = {
      0: Moment(timestamp).format('YYYY-MM-DD'),
      1: Moment(dias_lunes[0]).subtract(1, 'days').format('YYYY-MM-DD'),
      2: Moment(dias_lunes[1]).subtract(1, 'days').format('YYYY-MM-DD'),
      3: Moment(dias_lunes[2]).subtract(1, 'days').format('YYYY-MM-DD'),
      4: Moment(dias_lunes[3]).subtract(1, 'days').format('YYYY-MM-DD'),
      5: Moment(dias_lunes[4]).subtract(1, 'days').format('YYYY-MM-DD'),
      6: Moment(dias_lunes[5]).subtract(1, 'days').format('YYYY-MM-DD'),
      7: Moment(dias_lunes[6]).subtract(1, 'days').format('YYYY-MM-DD'),
      8: Moment(dias_lunes[7]).subtract(1, 'days').format('YYYY-MM-DD'),
    };
    // OBTENER DIAS DE LA SEMANA
    let _fechas = [];
    let counter2 = 0;
    while (
      !Moment(dias_lunes[semanaID])
        .add(counter2, 'days')
        .isSame(Moment(fechasFinales[semanaID]))
    ) {
      _fechas.push(
        Moment(dias_lunes[semanaID]).add(counter2, 'days').format('YYYY-MM-DD'),
      );
      counter2++;
    }
    _fechas.push(
      Moment(dias_lunes[semanaID]).add(counter2, 'days').format('YYYY-MM-DD'),
    );
    return _fechas;
  };

  return (
    <Container bgColor="white">
      <Content marginBottom={0} style={globalStyles.content}>
        <ReporteDiario />
        <ReporteSemanal />
      </Content>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
