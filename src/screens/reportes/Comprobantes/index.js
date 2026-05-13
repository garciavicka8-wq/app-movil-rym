import React, {useEffect, useState, useLayoutEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {Container, Content, Footer} from '../../../components/Layout';
import ComprobantesList from './components/Comprobantes';
import ReportarDepositoButton from './components/ReportarDepositoButton';
import {setCargandoPeriodos} from '../../../features/tickets/reportes/reportesSlice';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';

export default function Comprobantes({navigation}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    dispatch(setCargandoPeriodos(false));

    return () => {
      dispatch(setCargandoPeriodos(true));
    };
  }, []);

  const handleSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Comprobantes" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content marginBottom={100}>
          <ComprobantesList refreshTrigger={refreshTrigger} />
        </Content>
        <Footer footerColor="transparent" height={100} style={styles.footer}>
          <ReportarDepositoButton onSaved={handleSaved} />
        </Footer>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'center',
  },
});
