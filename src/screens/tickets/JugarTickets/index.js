import React, {useEffect, useState} from 'react';
import ListaSorteosPendientes from './components/ListaSorteosPendientes';
import TablaApuestas from './components/TablaApuestas';
import FooterContent from './components/FooterContent';
import {Container, Footer} from '../../../components/Layout';
import {useNetInfo} from '@react-native-community/netinfo';
import {NoConnectionSnackbar} from '../../../components';
import CustomStatusBar from '../../../components/CustomStatusBar';

export default function JugarTickets() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected === false) {
      setOpenSnackbar(true);
    }
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
    }
  }, [netInfo.isConnected]);

  return (
    <Container bgColor="white">
      <CustomStatusBar />
      <ListaSorteosPendientes />
      <TablaApuestas />
      <Footer>
        <FooterContent />
      </Footer>
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}
