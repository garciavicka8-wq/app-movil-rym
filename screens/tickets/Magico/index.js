import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {Container, Footer} from '../../../components/Layout';
import ListaProximosSorteos from './components/ListaProximosSorteos';
import {obtenerProximosSorteos} from '../../../services/tickets';
import LoadingIndicator from '../../../components/LoadingIndicator';
import SeccionOpciones from './components/SeccionOpciones';
import Registrar from './components/Registrar';
import {Colors} from '../../../utils';
import {
  setCifras,
  setMonto,
  setNumeroJugadas,
  setNumeroLugares,
  setProximosSorteos,
  setSorteoSeleccionado,
} from '../../../features/tickets/magico/magicoSlice';
import {useDispatch} from 'react-redux';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import {useCustomNavigation} from '../../../hooks';

export default function Magico() {
  const {isFocused} = useCustomNavigation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [cargando, setCargando] = useState(true);
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo && netInfo.isConnected === false) {
      setOpenSnackbar(true);
      setCargando(false);
    }
    if (netInfo && netInfo.isConnected) {
      setOpenSnackbar(false);
      cargarProximosSorteos();
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    return () => {
      dispatch(setProximosSorteos([]));
      dispatch(setSorteoSeleccionado(null));
      dispatch(setNumeroJugadas('1'));
      dispatch(setCifras('3'));
      dispatch(setNumeroLugares(['1']));
      dispatch(setMonto('1'));
    };
  }, []);

  const cargarProximosSorteos = async () => {
    try {
      setCargando(true);
      const sorteos = await obtenerProximosSorteos();
      dispatch(setProximosSorteos(sorteos));
      dispatch(setNumeroJugadas('1'));
      dispatch(setSorteoSeleccionado(sorteos[0]));
      dispatch(setCifras('3'));
      dispatch(setNumeroLugares(['1']));
      dispatch(setMonto('1'));
      setCargando(false);
    } catch ({message}) {
      alert(message);
    }
  };

  if (cargando)
    return (
      <>
        {isFocused && <StatusBar backgroundColor={Colors.primary} />}
        <LoadingIndicator />
      </>
    );

  return (
    <Container bgColor="white">
      {isFocused && <StatusBar backgroundColor={Colors.primary} />}
      {/* LISTA DE LOS PROXIMOS SORTEOS */}
      <ListaProximosSorteos />
      {/* SECCION DE OPCIONES */}
      <SeccionOpciones />
      {/* MONTO */}
      <Footer footerColor={Colors.dark}>
        <Registrar />
      </Footer>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
