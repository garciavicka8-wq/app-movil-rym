import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Surface} from 'react-native-paper';
import {APP_NAVIGATION} from '../../../../constants';
import {useCustomNavigation} from '../../../../hooks';
import {useDispatch} from 'react-redux';
import {setTransaccionStore} from '../../../../features/taecel/taecelSlice';
const LOGO_RYM = require('../../../../assets/warning.png');

export default function UltimaTxnCard({txn}) {
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  const handleOnPress = () => {
    dispatch(setTransaccionStore(txn));
    navigation.navigate(APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION);
  };

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor:
            txn.Status == 'Exitosa'
              ? '#a5d6a7'
              : txn.Status == 'Procesando'
              ? 'orange'
              : '#ef9a9a',
        },
      ]}>
      <TouchableWithoutFeedback onPress={() => handleOnPress()}>
        <View style={styles.itemWrapper}>
          <Image
            source={txn.logo ? {uri: txn.logo} : LOGO_RYM}
            style={{width: 100, height: 50}}
            resizeMode="contain"
          />
          {/* <Text style={{color: '#000'}}>{txn.Carrier}</Text> */}
          <Text style={{color: '#000', fontSize: 12}}>
            {txn._fecha} {txn._hora}
          </Text>
          {txn.Status == 'Procesando' && (
            <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>
              click para revisar
            </Text>
          )}
          <Text style={styles.amount}>{txn.Monto}</Text>
        </View>
      </TouchableWithoutFeedback>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  itemWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    backgroundColor: '#fff',
    width: 100,
    textAlign: 'center',
    marginTop: 10,
    borderRadius: 8,
    color: '#000',
    paddingVertical: 5,
  },
});
