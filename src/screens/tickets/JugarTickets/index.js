import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import ListaSorteosPendientes from './components/ListaSorteosPendientes';
import TablaApuestas from './components/TablaApuestas';
import FooterContent from './components/FooterContent';
import {Container, Content, Footer} from '../../../components/Layout';
import {useNetInfo} from '@react-native-community/netinfo';
import {NoConnectionSnackbar} from '../../../components';
import {useCustomNavigation} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';

export default function JugarTickets({navigation}) {
  const {isFocused} = useCustomNavigation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const netInfo = useNetInfo();

  useEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  useEffect(() => {
    if (netInfo.isConnected === false) {
      setOpenSnackbar(true);
    }
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
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
          title="Jugar Tickets" 
        />
      </Appbar.Header>
      
      <Content marginBottom={100}>
        <ListaSorteosPendientes />
        <TablaApuestas />
      </Content>
      
      <Footer style={styles.footer}>
        <FooterContent />
      </Footer>
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
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 10,
  }
});
