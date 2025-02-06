import React from 'react';
import {Text} from 'react-native';
import {Row} from 'react-native-easy-grid';
import ReporteButton from './ReporteButton';
import {Styles as globalStyles} from '../../../../utils';

export default function ReporteSemanalLoader() {
  return (
    <>
      <Text style={globalStyles.sectionTitle}>Semanal</Text>
      <Row>
        <ReporteButton disabled />
        <ReporteButton disabled />
        <ReporteButton disabled />
      </Row>
      <Row>
        <ReporteButton disabled />
        <ReporteButton disabled />
        <ReporteButton disabled />
      </Row>
    </>
  );
}
