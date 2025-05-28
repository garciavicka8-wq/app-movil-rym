import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {useSelector} from 'react-redux';
import usePago from '../hooks/usePago';

export default function ListaPagos() {
  const {cargandoPagos, pagosRealizados} = useSelector(state => state.pagos);
  const pagosHook = usePago();

  useEffect(() => {
    pagosHook.obtenerPagos();
  }, []);

  if (cargandoPagos) {
    return (
      <List.Item
        title="cargando pagos"
        description="..."
        left={() => <List.Icon icon="format-list-bulleted" />}
      />
    );
  }

  return (
    <>
      <List.Item
        title="Lista de Pagos"
        description="se muestran los pagos realizados de la semana en curso"
        left={() => <List.Icon icon="format-list-bulleted" />}
      />
      <Divider />
      {pagosRealizados.map(item => (
        <List.Item
          key={item.id}
          title={item.fechaPago + ' ' + item.horaPago}
          description={item.numeroBoleto}
          left={() => <List.Icon icon="cash" color="green" />}
          right={() => <Text>{item.premio}</Text>}
        />
      ))}
    </>
  );
}
