import React from 'react';
import {Container, Content, Footer} from '../../../components/Layout';
import ComprobantesList from './components/Comprobantes';
import ReportarDepositoButton from './components/ReportarDepositoButton';
import {Styles as globalStyles} from '../../../utils';
import {useDispatch} from 'react-redux';
import {useEffect, useState} from 'react';
import {setCargandoPeriodos} from '../../../features/tickets/reportes/reportesSlice';
import {View} from 'react-native';

export default function Comprobantes() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dispatch = useDispatch();

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
    <Container bgColor="white">
      <Content marginBottom={100} style={globalStyles.content}>
        <ComprobantesList refreshTrigger={refreshTrigger} />
      </Content>
      <Footer footerColor="white" height={90}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 15,
            paddingBottom: 10,
            justifyContent: 'center',
          }}>
          <ReportarDepositoButton onSaved={handleSaved} />
        </View>
      </Footer>
    </Container>
  );
}
