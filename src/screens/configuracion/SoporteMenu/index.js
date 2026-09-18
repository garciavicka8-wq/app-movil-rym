import React, {useLayoutEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Appbar, Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Container, Content} from '../../../components/Layout';
import CustomStatusBar from '../../../components/CustomStatusBar';
import MenuOpcion from '../ConfiguracionMenu/components/MenuOpcion';
import {Colors} from '../../../utils';
import {APP_NAVIGATION} from '../../../constants';

export default function SoporteMenu({navigation: navProp}) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navProp?.setOptions?.({headerShown: false});
  }, [navProp]);

  const irANueva = tipo => {
    navigation.navigate(APP_NAVIGATION.SCREENS.SOPORTE_NUEVA, {tipo});
  };

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content
          color="white"
          titleStyle={styles.appBarTitle}
          title="Soporte"
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content marginBottom={40}>
          <Text style={styles.subtitle}>
            Envía tu solicitud directamente al panel, sin necesidad de WhatsApp.
          </Text>

          <View style={styles.card}>
            <MenuOpcion
              label="Diferencia para pago de premio"
              descripcion="Solicita el faltante para pagar un premio a un cliente"
              leftIcon="cash-multiple"
              rightIcon="chevron-right"
              onPress={() => irANueva('diferencia_premio')}
            />
            <View style={styles.divider} />
            <MenuOpcion
              label="Solicitud de insumos"
              descripcion="Rollos de papel, impresora, cable, etc."
              leftIcon="package-variant"
              rightIcon="chevron-right"
              onPress={() => irANueva('insumos')}
            />
          </View>

          <Button
            mode="outlined"
            icon="history"
            style={styles.historialButton}
            contentStyle={{height: 48}}
            textColor={Colors.primary}
            onPress={() =>
              navigation.navigate(APP_NAVIGATION.SCREENS.SOPORTE_HISTORIAL)
            }>
            Mis solicitudes
          </Button>
        </Content>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  historialButton: {
    marginTop: 24,
    borderRadius: 12,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
});
