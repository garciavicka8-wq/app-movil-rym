import React from 'react';
import {Text} from 'react-native';
import {Row} from 'react-native-easy-grid';
import ReporteButton from './ReporteButton';
import {Styles as globalStyles} from '../../../../utils';

export default function ReporteDiarioLoader() {
  return (
    <>
      <Text style={globalStyles.sectionTitle}>Diaria</Text>
      <Row>
        <ReporteButton disabled label="hoy" />
        <ReporteButton disabled label="lunes" />
        <ReporteButton disabled label="martes" />
      </Row>
      <Row>
        <ReporteButton disabled label="miercoles" />
        <ReporteButton disabled label="jueves" />
        <ReporteButton disabled label="viernes" />
      </Row>
      <Row>
        <ReporteButton disabled label="sabado" />
        <ReporteButton disabled label="domingo" />
        <ReporteButton disabled label="semanal" />
      </Row>
    </>
  );
}
