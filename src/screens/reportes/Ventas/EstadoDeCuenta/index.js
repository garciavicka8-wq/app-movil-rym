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
import {obtenerUsuarioDb} from '../../../../services/auth';
import {definePeriod} from '../../../../services/estado_de_cuenta';
import {useNetInfo} from '@react-native-community/netinfo';
import {getUserAccountStatus} from '../services';

export default function EstadoDeCuenta() {
  const {cargandoEstadoDeCuenta, periodoSeleccionado, tipoEstadoDeCuenta} =
    useSelector(state => state.reportes);
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

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
      const userDB = await obtenerUsuarioDb();
      const period = await definePeriod(periodoSeleccionado);
      const accountStatus = await getUserAccountStatus(period, userDB);
      dispatch(setEstadoDeCuenta(accountStatus));
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
