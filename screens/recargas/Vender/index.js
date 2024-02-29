import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {Card} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Content} from '../../../components/Layout';
import {setProductoSeleccionado} from '../../../features/taecel/taecelSlice';
import Campos from './components/Campos';
import ProductoLogo from './components/ProductoLogo';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {Colors} from '../../../utils';
import {useCustomNavigation} from '../../../hooks';

export default function Vender() {
  const {isFocused} = useCustomNavigation();
  const {cargandoCredito} = useSelector(state => state.credito);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setProductoSeleccionado(null));
    };
  }, []);

  if (cargandoCredito) return <LoadingIndicator />;

  return (
    <Container>
      {isFocused && <StatusBar backgroundColor={Colors.blue} />}
      <Content marginBottom={15}>
        <ProductoLogo />
        <View style={styles.productoBox}>
          <Card style={{backgroundColor: 'white'}}>
            <Card.Content>
              <Campos />
            </Card.Content>
          </Card>
        </View>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  productoBox: {
    marginTop: 20,
    marginHorizontal: 10,
  },
});
