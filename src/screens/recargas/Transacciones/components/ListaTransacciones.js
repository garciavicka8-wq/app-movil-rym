import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {List} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {LoadingIndicator} from '../../../../components';
import {APP_NAVIGATION} from '../../../../constants';
import {setTransaccionStore} from '../../../../features/taecel/taecelSlice';
import {useCustomNavigation} from '../../../../hooks';
const LOGO_RYM = require('../../../../assets/ball.png');

export default function ListaTransacciones({cargando, transacciones}) {
  return (
    <ScrollView>
      {cargando && <LoadingIndicator />}
      {!cargando && transacciones.length == 0 && (
        <Text style={{marginTop: 20, textAlign: 'center'}}>
          No se encontraron transacciones
        </Text>
      )}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
          marginBottom: 90,
        }}>
        {transacciones.map(item => (
          <TransaccionListItem key={item.TransID} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

const TransaccionListItem = ({item}) => {
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  const handlePress = () => {
    dispatch(setTransaccionStore(item));
    navigation.navigate(APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION);
  };

  return (
    <List.Item
      style={{
        backgroundColor: item.Status == 'PROCESSING' ? '#ffcc80' : undefined,
      }}
      title={item.Carrier ? item.Carrier : item.Telefono}
      description={props => (
        <Descripcion fecha={item.Fecha} referencia={item.Telefono} />
      )}
      left={props => (
        <List.Image
          variant="image"
          {...props}
          source={item.logo ? {uri: item.logo} : LOGO_RYM}
          style={{resizeMode: 'center'}}
        />
      )}
      right={props => (
        <StatusText
          status={item.Status == 'PROCESSING' ? 'Procesando' : item.Status}
          monto={item.Monto}
        />
      )}
      onPress={handlePress}
    />
  );
};

const StatusText = ({status, monto}) => {
  const bgColor =
    status == 'Exitosa' ? 'green' : status == 'Procesando' ? 'orange' : 'red';
  return (
    <View style={styles.statusBox}>
      <Text style={styles.text}>{monto}</Text>
      <Text style={[styles.statusText, {backgroundColor: bgColor}]}>
        {status}
      </Text>
    </View>
  );
};

const Descripcion = ({fecha, referencia}) => {
  return (
    <>
      {fecha != '' && (
        <View>
          <Text style={styles.text}>{referencia}</Text>
        </View>
      )}
      {fecha != '' && (
        <View>
          <Text style={styles.text}>{fecha}</Text>
        </View>
      )}
      {fecha == '' && (
        <View>
          <Text
            style={{
              color: 'red',
            }}>
            Click para más detalles
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#000',
  },
  statusBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    width: 90,
    color: 'white',
    padding: 2,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
