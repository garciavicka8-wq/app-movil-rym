import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useNetInfo} from '@react-native-community/netinfo';
import {useTransacciones} from '../../../hooks';
import {LoadingIndicator, NoConnection} from '../../../components';
import ListaTransacciones from './components/ListaTransacciones';
import PeriodoListItem from './components/PeriodoListItem';

export default function Transacciones() {
  const {transacciones} = useSelector(state => state.taecel);
  const {
    cargandoTransacciones,
    cargarTransacciones,
    periodo,
    totalTransacciones,
  } = useTransacciones();
  const netInfo = useNetInfo();

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo?.isConnected) {
      cargarTransacciones(0);
    }
  }, [netInfo?.isConnected]);

  const handleSelectPeriodo = value => {
    cargarTransacciones(value);
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  if (cargandoTransacciones) return <LoadingIndicator />;

  return (
    <View>
      <PeriodoListItem
        cargandoTransacciones={cargandoTransacciones}
        periodo={periodo}
        totalTransacciones={totalTransacciones}
        handleSelectPeriodo={handleSelectPeriodo}
      />
      <Divider />
      <ListaTransacciones
        cargando={cargandoTransacciones}
        transacciones={transacciones}
      />
    </View>
  );
}
