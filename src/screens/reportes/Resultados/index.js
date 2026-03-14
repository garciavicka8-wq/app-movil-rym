import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Container, Content, Footer} from '../../../components/Layout';
// CUSTOM COMPONENTS
import ListaNumeros from './components/ListaNumeros';
import SelectSorteo from './components/SelectSorteo';
// STORE ACTIONS & REDUCERS
import {obtenerUltimosSorteosApi} from '../../../services/tickets';
import {
  setCargandoSorteosJugados,
  setSorteoSelected,
  setSorteosJugados,
} from '../../../features/tickets/ganadores/ganadoresSlice';
// DATABASE API
import NumerosContainer from './components/NumerosContainer';
import {useGanadores, useLogout} from '../../../hooks';
import {Alert} from 'react-native';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';

export default function Ganadores() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const ganadoresHook = useGanadores();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cargarSorteosJugados();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  const cargarSorteosJugados = async () => {
    try {
      dispatch(setCargandoSorteosJugados(true));
      const _sorteos = await obtenerUltimosSorteosApi();
      dispatch(setSorteosJugados(_sorteos));
      dispatch(setCargandoSorteosJugados(false));
      // CARGAR PUBLICACION NUMEROS GANADORES
      if (_sorteos.length > 0) {
        dispatch(setSorteoSelected(_sorteos[0]));
        cargarPublicacion(_sorteos[0].fecha);
      }
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

  const cargarPublicacion = async fechaSorteo => {
    ganadoresHook.obtenerPublicacion(fechaSorteo);
  };

  return (
    <Container bgColor="white">
      <NumerosContainer />
      <Content>
        <ListaNumeros />
      </Content>
      <Footer>
        <SelectSorteo />
      </Footer>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
