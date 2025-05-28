import React from 'react';
import {Container, Content} from '../../../components/Layout';
import ListaPagos from './components/ListaPagos';
import RealizarPago from './components/RealizarPago';

export default function Pagos() {
  return (
    <Container>
      <Content>
        <RealizarPago />
        <ListaPagos />
      </Content>
    </Container>
  );
}
