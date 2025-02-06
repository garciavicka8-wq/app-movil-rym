import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Alert} from 'react-native';
import {
  setCargandoPagos,
  setPagosRealizados,
} from '../../../features/tickets/pagos/pagosSlice';
import {Container, Content} from '../../../components/Layout';
import {getPaidPrizes} from '../../../services/tickets';
import ListaPagos from './components/ListaPagos';
import RealizarPago from './components/RealizarPago';
import {useLogout} from '../../../hooks';
import {ERROR_CODE_NAMES} from '../../../errors';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import {useNetInfo} from '@react-native-community/netinfo';

export default function Pagos() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cargarPagos();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    return () => {
      dispatch(setCargandoPagos(false));
    };
  }, []);

  const cargarPagos = async () => {
    try {
      dispatch(setCargandoPagos(true));
      const pagos = await getPaidPrizes();
      dispatch(setPagosRealizados(pagos));
      dispatch(setCargandoPagos(false));
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

  return (
    <Container>
      <Content>
        <RealizarPago />
        <ListaPagos />
      </Content>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
