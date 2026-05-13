import React from 'react';
import {ScrollView, StyleSheet, Text, View, Image} from 'react-native';
import {Card} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {LoadingIndicator} from '../../../../components';
import {APP_NAVIGATION} from '../../../../constants';
import {setTransaccionStore} from '../../../../features/taecel/taecelSlice';
import {useCustomNavigation} from '../../../../hooks';
const LOGO_RYM = require('../../../../assets/ball.png');

export default function ListaTransacciones({cargando, transacciones}) {
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {cargando && <LoadingIndicator />}
      {!cargando && transacciones.length == 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No se encontraron transacciones
          </Text>
        </View>
      )}
      <View style={styles.listContainer}>
        {transacciones.map(item => (
          <TransaccionCard key={item.TransID} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

const TransaccionCard = ({item}) => {
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  const handlePress = () => {
    dispatch(setTransaccionStore(item));
    navigation.navigate(APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION);
  };

  const getStatusConfig = (status) => {
    switch(status.toLowerCase()) {
      case 'exitosa':
        return { color: '#10B981', label: 'Exitosa', icon: 'check-circle' };
      case 'processing':
      case 'procesando':
        return { color: '#F59E0B', label: 'Procesando', icon: 'clock' };
      default:
        return { color: '#EF4444', label: status, icon: 'alert-circle' };
    }
  };

  const statusConfig = getStatusConfig(item.Status);

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={item.logo ? {uri: item.logo} : LOGO_RYM} 
              style={styles.logo}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.carrierText} numberOfLines={1}>
              {item.Carrier ? item.Carrier : 'Recarga'}
            </Text>
            <Text style={styles.phoneText}>{item.Telefono}</Text>
            <Text style={styles.dateText}>{item.Fecha}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amountText}>{item.Monto}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  listContainer: {
    gap: 12,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter',
    color: '#64748B',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
  },
  carrierText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  phoneText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  dateText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#94A3B8',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
