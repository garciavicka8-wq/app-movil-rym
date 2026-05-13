import React, {useEffect, useState, useLayoutEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Appbar} from 'react-native-paper';
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
import {ERROR_CODE_NAMES} from '../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';

export default function Ganadores({navigation}) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const ganadoresHook = useGanadores();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Resultados" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <NumerosContainer />
        <Content style={styles.content}>
          <ListaNumeros />
        </Content>
        <Footer style={styles.footer}>
          <SelectSorteo />
        </Footer>
      </Container>

      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
});
