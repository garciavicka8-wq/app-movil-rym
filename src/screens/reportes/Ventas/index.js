import React, {useEffect, useState, useLayoutEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {Container, Content} from '../../../components/Layout';
import {
  resetBotonesReporte,
  setPeriodos,
  setCargandoPeriodos,
} from '../../../features/tickets/reportes/reportesSlice';
import ReporteSemanal from './components/ReporteSemanal';
import ReporteDiario from './components/ReporteDiario';
import {obtenerPeriodosReporteApi} from '../../../services/tickets';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useLogout} from '../../../hooks';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';

export default function Ventas({navigation}) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
      const semanas = await obtenerPeriodosReporteApi();
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

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Reporte de Ventas" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content marginBottom={40}>
          <ReporteDiario />
          <View style={styles.spacer} />
          <ReporteSemanal />
        </Content>
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
  spacer: {
    height: 30,
  },
});
