import React from 'react';
import {Text} from 'react-native';
import {Moment} from '../../../../utils';

export default function PeriodoDescripcion({cargando, periodo, total}) {
  const inicial = {
    dia: periodo.inicial !== '' ? Moment(periodo.inicial).format('DD') : '',
    mes: periodo.inicial !== '' ? Moment(periodo.inicial).format('MMM') : '',
  };
  const final = {
    dia: periodo.final !== '' ? Moment(periodo.final).format('DD') : '',
    mes: periodo.final !== '' ? Moment(periodo.final).format('MMM') : '',
  };
  return (
    <>
      {cargando && (
        <Text style={{fontStyle: 'italic'}}>cargando periodo...</Text>
      )}
      {!cargando && (
        <>
          <Text>
            {inicial.dia} {inicial.mes} al {final.dia} {final.mes}
          </Text>
          <Text>Trans. exitosas: {total} MXN</Text>
        </>
      )}
    </>
  );
}
