import React, {useEffect, useState} from 'react';
import {Container, Content} from '../../../components/Layout';
import CancelarBoleto from './components/CancelarBoleto';
import ListaCancelados from './components/ListaCancelados';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import useCancelarBoleto from './hooks/useCancelarBoleto';

export default function Cancelados() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const cancelarHook = useCancelarBoleto();
  const netInfo = useNetInfo();

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cancelarHook.obtenerBoletos();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

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
