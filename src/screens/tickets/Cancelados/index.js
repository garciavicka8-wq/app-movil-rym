import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {useDispatch} from 'react-redux';
import {Container, Content} from '../../../components/Layout';
import {
  setBoletosCancelados,
  setCargandoCancelados,
} from '../../../features/tickets/cancelados/canceladosSlice';
import {getCanceledTickets} from '../../../services/tickets';
import CancelarBoleto from './components/CancelarBoleto';
import ListaCancelados from './components/ListaCancelados';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useLogout} from '../../../hooks';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';

export default function Cancelados() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cargarBoletosCancelados();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    return () => {
      dispatch(setCargandoCancelados(false));
    };
  }, []);

  const cargarBoletosCancelados = async () => {
    try {
      dispatch(setCargandoCancelados(true));
      const boletos = await getCanceledTickets();
      dispatch(setBoletosCancelados(boletos));
      dispatch(setCargandoCancelados(false));
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
      <Content marginBottom={0}>
        <CancelarBoleto />
        <ListaCancelados />
      </Content>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
