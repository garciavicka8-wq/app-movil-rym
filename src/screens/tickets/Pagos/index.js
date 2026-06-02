import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar, FAB} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import ListaPagos from './components/ListaPagos';
import RealizarPago from './components/RealizarPago';
import {useCustomNavigation, useThermalPrinter} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors, Print} from '../../../utils';

const DEV_QR_BOLETO = '3710-01384995-89708';

export default function Pagos({navigation}) {
  const {isFocused} = useCustomNavigation();
  const thermalPrinter = useThermalPrinter();

  useEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  return (
    <Container bgColor={Colors.lightBackground}>
      {isFocused && <CustomStatusBar color="darkBackground" />}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content
          color="white"
          titleStyle={styles.appBarTitle}
          title="Pagos de Premios"
        />
      </Appbar.Header>
      <Content marginBottom={15}>
        <RealizarPago />
        <ListaPagos />
      </Content>
      {__DEV__ && (
        <FAB
          icon="qrcode"
          label="QR test"
          style={styles.fab}
          onPress={async () => {
            if (!(await thermalPrinter.isPrintingPossible())) return;
            await thermalPrinter.print(() => Print.qrTicket(DEV_QR_BOLETO));
          }}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
