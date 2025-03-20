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
import ReportarDepositoButton from './components/ReportarDepositoButton';

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

      return Array.from({length: 9}, (_, i) => {
        const periodo = obtenerPeriodo(timestamp, i);
        return {
          id: uuid(),
          inicial: periodo[0],
          final: periodo.at(-1), // `.at(-1)` es más limpio que `periodo[periodo.length - 1]`
          active: false,
        };
      });
    } catch (error) {
      throw new Error(error.message || 'Error al obtener fechas');
    }
  };

  const obtenerPeriodo = (timestamp, semanaID) => {
    const ocurrencies = 9;
    let diasLunes = [];
    let fecha = Moment(timestamp);

    // Asegurar que `timestamp` sea un lunes inicial válido
    if (fecha.day() !== 1) {
      fecha = fecha.startOf('week').add(1, 'days'); // Forzar inicio de semana en lunes
    }

    // Obtener los últimos 9 lunes
    while (diasLunes.length < ocurrencies) {
      diasLunes.push(fecha.format('YYYY-MM-DD'));
      fecha = fecha.subtract(7, 'days'); // Restamos 7 días cada vez para ir de lunes en lunes
    }

    // Generar fechas finales (domingo anterior a cada lunes)
    const fechasFinales = diasLunes.map(
      lunes => Moment(lunes).add(6, 'days').format('YYYY-MM-DD'), // Avanzamos 6 días para llegar al domingo
    );

    // Validar si `semanaID` está dentro del rango válido
    if (semanaID < 0 || semanaID >= diasLunes.length) {
      throw new Error('semanaID fuera de rango');
    }

    // Obtener todos los días desde el lunes hasta el domingo
    let _fechas = [];
    let currentDate = Moment(diasLunes[semanaID]);
    const endDate = Moment(fechasFinales[semanaID]);

    while (currentDate.isSameOrBefore(endDate)) {
      _fechas.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'days');
    }

    return _fechas;
  };

  return (
    <Container bgColor="white">
      <Content marginBottom={0} style={globalStyles.content}>
        <ReporteDiario />
        <ReporteSemanal />
        {/* REPORTAR DESPOSITO BUTTON */}
        <ReportarDepositoButton />
      </Content>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
