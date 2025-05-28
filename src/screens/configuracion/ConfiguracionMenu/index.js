import React from 'react';
import {Divider} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import MenuOpciones from './components/MenuOpciones';
import PerfilHeader from './components/PerfilHeader';
import Version from './components/Version';
import CustomStatusBar from '../../../components/CustomStatusBar';

export default function ConfiguracionMenu() {
  return (
    <>
      <CustomStatusBar color={'dark'} />
      <Container>
        <Content>
          <PerfilHeader />
          <Divider style={{marginVertical: 20}} />
          <MenuOpciones />
          <Version />
        </Content>
      </Container>
    </>
  );
}
