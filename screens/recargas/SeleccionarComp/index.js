import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Content} from '../../../components/Layout';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {
  filtrarCarriers,
  setCarrierSeleccionado,
  setQueryCarrierResults,
} from '../../../features/taecel/taecelSlice';
import {useCustomNavigation} from '../../../hooks';
import {Styles as globalStyles, uuid} from '../../../utils';
import CarrierCard from './components/CarrierCard';
import Header from './components/Header';
import {Col, Grid, Row} from 'react-native-easy-grid';

export default function SeleccionarComp() {
  const [filtrandoCarriers, setFiltrandoCarriers] = useState(true);
  const {categoriaSeleccionada, queryCarrierResults} = useSelector(
    state => state.taecel,
  );
  const [gridRows, setGridRows] = useState([]);
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    setFiltrandoCarriers(true);
    dispatch(filtrarCarriers(categoriaSeleccionada.ID));
    return () => {
      dispatch(setQueryCarrierResults([]));
    };
  }, []);

  useEffect(() => {
    createGridStructor();
  }, [queryCarrierResults]);

  const createGridStructor = () => {
    const numRows = Math.ceil(queryCarrierResults.length / 2);
    let rows = [];
    let row = [];
    for (let i = 0; i < numRows; i++) {
      if (queryCarrierResults[i] != undefined && row.length < 2) {
        row.push(queryCarrierResults[i]);
      }
      if (row.length == 2) {
        row = [];
        continue;
      }
      rows.push(row);
    }
    if (rows.length > 0 && rows[rows.length - 1].length % 2 != 0) {
      let lastCol = [...rows[rows.length - 1]];
      lastCol.push({ID: uuid(), Nombre: '', Logotipo: '', empty: true});
      rows[rows.length - 1] = lastCol;
    }
    setGridRows(rows);
    setFiltrandoCarriers(false);
  };

  const handlePress = carrier => {
    dispatch(setCarrierSeleccionado(carrier));
    navigation.navigate('Vender');
  };

  if (filtrandoCarriers)
    return (
      <>
        <Header />
        <LoadingIndicator />
      </>
    );

  return (
    <Container>
      <Header />
      <View style={globalStyles.navSectionTitle}>
        <Text style={globalStyles.navSectionTitleText}>
          Selecciona un proveedor
        </Text>
      </View>
      <Content marginBottom={30}>
        {!filtrandoCarriers && (
          <Grid>
            {gridRows.map((row, rowIndex) => (
              <Row key={rowIndex}>
                {row.map(col => (
                  <Col key={col.ID} size={50} style={{padding: 5}}>
                    <CarrierCard
                      text={col.Nombre}
                      imageURL={col.Logotipo}
                      empty={col.empty !== undefined}
                      onPress={() => handlePress(col)}
                    />
                  </Col>
                ))}
              </Row>
            ))}
          </Grid>
        )}
      </Content>
    </Container>
  );
}
