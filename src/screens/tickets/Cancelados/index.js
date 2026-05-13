import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import CancelarBoleto from './components/CancelarBoleto';
import ListaCancelados from './components/ListaCancelados';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import useCancelarBoleto from './hooks/useCancelarBoleto';
import {useCustomNavigation} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';

export default function Cancelados({navigation}) {
  const {isFocused} = useCustomNavigation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const cancelarHook = useCancelarBoleto();
  const netInfo = useNetInfo();

  useEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cancelarHook.obtenerBoletos();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  return (
    <Container bgColor={Colors.lightBackground}>
      {isFocused && <CustomStatusBar color="darkBackground" />}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Cancelar Boleto" 
        />
      </Appbar.Header>
      <Content marginBottom={15}>
        <CancelarBoleto />
        <ListaCancelados />
      </Content>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
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
