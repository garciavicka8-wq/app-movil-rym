import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  resetBotonesReporte,
  setCargandoPeriodos,
  setPeriodos,
} from '../../../features/tickets/reportes/reportesSlice';
import {Styles as globalStyles} from '../../../utils';
import {Container, Content} from '../../../components/Layout';
import ReporteSemanal from './components/ReporteSemanal';
import ReporteDiario from './components/ReporteDiario';
import {obtenerPeriodosReporteApi} from '../../../services/tickets';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useLogout} from '../../../hooks';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import {Alert} from 'react-native';
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

    return () => {
      dispatch(resetBotonesReporte());
    };
  }, [netInfo.isConnected]);

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
      return await obtenerPeriodosReporteApi();
    } catch (error) {
      throw new Error(error.message || 'Error al obtener fechas');
    }
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
