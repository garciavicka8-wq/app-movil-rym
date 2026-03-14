import React from 'react';
import {Card, List} from 'react-native-paper';
import {Colors} from '../../../utils';
import {Container, Content} from '../../../components/Layout';
import {useCustomNavigation} from '../../../hooks';
import {APP_NAVIGATION} from '../../../constants';

export default function Main() {
  const navigation = useCustomNavigation();

  return (
    <Container>
      <Content>
        <Card>
          <Card.Content>
            <List.Item
              title="Ventas"
              description=""
              left={() => (
                <List.Icon icon="cash-register" color={Colors.primary} />
              )}
              right={props => <List.Icon {...props} icon="arrow-right" />}
              onPress={() => navigation.navigate(APP_NAVIGATION.SCREENS.VENTAS)}
            />
            <List.Item
              title="Resultados"
              description=""
              left={() => <List.Icon icon="pin" color={Colors.lightBrown} />}
              right={props => <List.Icon {...props} icon="arrow-right" />}
              onPress={() =>
                navigation.navigate(APP_NAVIGATION.SCREENS.NUMEROS_GANADORES)
              }
            />
            <List.Item
              title="Comprobantes"
              description=""
              left={() => <List.Icon icon="image" color={Colors.primary} />}
              right={props => <List.Icon {...props} icon="arrow-right" />}
              onPress={() =>
                navigation.navigate(APP_NAVIGATION.SCREENS.COMPROBANTES)
              }
            />
          </Card.Content>
        </Card>
      </Content>
    </Container>
  );
}
