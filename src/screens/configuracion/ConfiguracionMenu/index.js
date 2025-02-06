import React from 'react';
import {StatusBar} from 'react-native';
import {Divider} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import MenuOpciones from './components/MenuOpciones';
import PerfilHeader from './components/PerfilHeader';
import Version from './components/Version';
import {useCustomNavigation} from '../../../hooks';
import {Colors} from '../../../utils';

export default function ConfiguracionMenu() {
  const {isFocused} = useCustomNavigation();

  return (
    <>
      {isFocused && <StatusBar backgroundColor={Colors.dark} />}
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
