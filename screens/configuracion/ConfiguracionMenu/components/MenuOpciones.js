import React from 'react';
import {Card} from 'react-native-paper';
import {APP_NAVIGATION} from '../../../../constants';
import {useCustomNavigation} from '../../../../hooks';
import LogoutButton from './LogoutButton';
import MenuOpcion from './MenuOpcion';

export default function MenuOpciones() {
  const navigation = useCustomNavigation();

  const handleNavigate = screenName => {
    navigation.navigate(APP_NAVIGATION.SCREENS[screenName]);
  };

  return (
    <Card style={{backgroundColor: 'white'}}>
      <Card.Content>
        <MenuOpcion
          label="Seguridad"
          leftIcon="key"
          rightIcon="chevron-right"
          onPress={() => handleNavigate('SEGURIDAD')}
        />
        <MenuOpcion
          label="Registrar Impresora"
          leftIcon="printer"
          rightIcon="chevron-right"
          onPress={() => handleNavigate('REGISTRAR_IMPRESORA')}
        />
        <MenuOpcion
          label="Código PIN"
          leftIcon="lock"
          rightIcon="chevron-right"
          onPress={() => handleNavigate('CODIGO_PIN')}
        />
        <MenuOpcion
          label="Comisión Recargas"
          leftIcon="account-cash"
          rightIcon="chevron-right"
          onPress={() => handleNavigate('ESTABLECER_COMISION')}
        />
        <LogoutButton />
      </Card.Content>
    </Card>
  );
}
