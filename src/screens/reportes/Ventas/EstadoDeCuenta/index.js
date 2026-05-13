import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  setCargandoEstadoDeCuenta,
  setEstadoDeCuenta,
} from '../../../../features/tickets/reportes/reportesSlice';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import NoConnection from '../../../../components/NoConnection';
import EstadoDiario from './components/EstadoDiario';
import EstadoSemanal from './components/EstadoSemanal';
import {definePeriod} from '../../../../services/estado_de_cuenta';
import {useNetInfo} from '@react-native-community/netinfo';
import {requestRymAPI} from '../../../../services/http';
import { Storage } from '../../../../utils';
import {useNavigation} from '@react-navigation/native';

export default function EstadoDeCuenta() {
  const {cargandoEstadoDeCuenta, periodoSeleccionado, tipoEstadoDeCuenta} =
    useSelector(state => state.reportes);
  const dispatch = useDispatch();
  const netInfo = useNetInfo();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Reporte',
      headerStyle: {
        backgroundColor: '#0E1321',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontFamily: 'Inter',
        fontWeight: 'bold',
      },
    });
  }, []);

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      _cargarEstadoDeCuenta();
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    return () => {
      dispatch(setCargandoEstadoDeCuenta(true));
    };
  }, []);

  const _cargarEstadoDeCuenta = async () => {
    try {
      dispatch(setCargandoEstadoDeCuenta(true));
      const userDB = Storage.getItem('usuario', true);
      const period = await definePeriod(periodoSeleccionado);
      const response = await requestRymAPI(
        'reportes/estado-cuenta',
        {start: period.start, end: period.end, usuario: userDB.usuario},
        true,
        'GET',
      );
      dispatch(setEstadoDeCuenta(response.data));
      dispatch(setCargandoEstadoDeCuenta(false));
    } catch ({message}) {
      Alert.alert('Error', message);
    }
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  if (cargandoEstadoDeCuenta) {
    return <LoadingIndicator />;
  }

  return (
    <>
      {tipoEstadoDeCuenta === 'diario' && <EstadoDiario />}
      {tipoEstadoDeCuenta === 'semanal' && <EstadoSemanal />}
    </>
  );
}
