import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import ListaPagos from './components/ListaPagos';
import RealizarPago from './components/RealizarPago';
import {useCustomNavigation} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';

export default function Pagos({navigation}) {
  const {isFocused} = useCustomNavigation();

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
