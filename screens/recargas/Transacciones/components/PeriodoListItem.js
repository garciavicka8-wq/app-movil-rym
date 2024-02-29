import React from 'react';
import {List} from 'react-native-paper';
import PeriodoDescripcion from './PeriodoDescripcion';
import PeriodoMenu from './PeriodoMenu';

export default function PeriodoListItem({
  cargandoTransacciones,
  periodo,
  totalTransacciones,
  handleSelectPeriodo,
}) {
  return (
    <List.Item
      title="Periodo de venta"
      description={props => (
        <PeriodoDescripcion
          {...props}
          cargando={cargandoTransacciones}
          periodo={periodo}
          total={totalTransacciones}
        />
      )}
      left={props => <List.Icon {...props} icon="calendar" color="skyblue" />}
      right={() => (
        <PeriodoMenu
          cargando={cargandoTransacciones}
          onMenuItemPress={handleSelectPeriodo}
        />
      )}
    />
  );
}
