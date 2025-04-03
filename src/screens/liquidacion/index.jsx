import React, {useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {Container, Content} from '../../components/Layout';
import ReportarDepositoButton from '../reportes/Ventas/components/ReportarDepositoButton';
import {Styles as globalStyles, Money, Storage, Utils} from '../../utils';
import {useDispatch} from 'react-redux';
import {setCargandoPeriodos} from '../../features/tickets/reportes/reportesSlice';
import Database from '../../database';
import {DATABASE_TABLES} from '../../constants';
import {List} from 'react-native-paper';

export default function Liquidacion() {
  const [usuario] = useState(Storage.getItem('tempUser', true));
  const [comprobantes, setComprobantes] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // ES NECESARIO PARA QUE EL BOTON SE MUESTRE CORRECTAMENTE
    dispatch(setCargandoPeriodos(false));
    loadComprobantes();

    return () => {
      dispatch(setCargandoPeriodos(true));
    };
  }, []);

  const loadComprobantes = async () => {
    try {
      const data = await Database.getItemsByProp(
        DATABASE_TABLES.VOUCHERS,
        'numeroUsuario',
        usuario.usuario,
      );
      console.log(data);
      const ordered = data
        .slice()
        .sort((a, b) => new Date(b['fecha']) - new Date(a['fecha']))
        .slice(0, 3);
      setComprobantes(ordered);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los comprobantes');
    }
  };

  return (
    <Container bgColor="white">
      <Content marginBottom={0} style={globalStyles.content}>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
          }}>
          <Text style={{fontSize: 26, fontWeight: '500'}}>Importe</Text>
          <Text style={{fontSize: 42, fontWeight: 'bold'}}>
            {Money(Utils.extractNumber(usuario.disableAccountReason))}
          </Text>
        </View>
        {/* COMPROBANTES */}
        {comprobantes.length > 0 &&
          comprobantes.map((item, index) => (
            <List.Item
              key={index}
              title={item?.visto ? 'Revisada' : 'En revisión'}
              description={`Capturada el ${item.fecha}`}
              left={props => <List.Icon {...props} icon="image" />}
            />
          ))}
        {/* REPORTAR DESPOSITO BUTTON */}
        <ReportarDepositoButton
          onSaved={capture => {
            setComprobantes(prevState => [capture, ...prevState]);
          }}
        />
      </Content>
    </Container>
  );
}
