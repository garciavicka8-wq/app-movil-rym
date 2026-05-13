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
import {Colors} from '../../../../utils';
const LOGO_RYM = require('../../../../assets/warning.png');

export default function UltimaTxnCard({txn}) {
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  const handleOnPress = () => {
    dispatch(setTransaccionStore(txn));
    navigation.navigate(APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION);
  };

  return (
    <TouchableWithoutFeedback onPress={() => handleOnPress()}>
      <View style={styles.cardContainer}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Image
              source={txn.logo ? {uri: txn.logo} : LOGO_RYM}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.carrierName} numberOfLines={1}>
              {txn.Carrier || 'Transacción'}
            </Text>
            <Text style={styles.dateTimeText}>
              {txn._fecha} - {txn._hora}
            </Text>
            {txn.Status == 'Procesando' && (
              <Text style={styles.processingText}>
                Procesando...
              </Text>
            )}
            {txn.Status != 'Procesando' && txn.Status != 'Exitosa' && (
              <Text style={styles.failedText}>
                Fallida
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={[
            styles.amountText,
            txn.Status == 'Exitosa' ? {color: Colors.green} : 
            txn.Status == 'Procesando' ? {color: Colors.dev} : {color: Colors.primary}
          ]}>
            ${txn.Monto}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: Colors.cardShadow || '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EFF6FF', // Soft pastel blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  carrierName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  dateTimeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#94A3B8',
  },
  processingText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: 'bold',
    color: 'orange',
    marginTop: 2,
  },
  failedText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 2,
  },
  rightSection: {
    marginLeft: 10,
  },
  amountText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
