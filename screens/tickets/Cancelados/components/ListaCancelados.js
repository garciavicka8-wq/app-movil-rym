import React from 'react';
import {Text} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {useSelector} from 'react-redux';

export default function ListaCancelados() {
  const {cargandoCancelados, boletosCancelados} = useSelector(
    state => state.cancelados,
  );

  if (cargandoCancelados) {
    return (
      <List.Item
        title="cargando cancelados"
        description="..."
        left={() => <List.Icon icon="format-list-bulleted" />}
      />
    );
  }

  return (
    <>
      <List.Item
        title="Lista de Cancelados"
        description="se muestran los boletos cancelados de la semana en curso"
        left={() => <List.Icon icon="format-list-bulleted" />}
      />
      <Divider />
      {boletosCancelados.map(item => (
        <List.Item
          key={item.id}
          title={item.fechaCancelacion + ' ' + item.horaCancelacion}
          description={item.numeroBoleto}
          left={() => <List.Icon icon="cash" color="green" />}
          right={() => <Text>{item.reembolso}</Text>}
        />
      ))}
    </>
  );
}
