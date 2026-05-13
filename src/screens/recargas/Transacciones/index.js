import React, {useEffect, useLayoutEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {useNetInfo} from '@react-native-community/netinfo';
import {useTransacciones} from '../../../hooks';
import {NoConnection} from '../../../components';
import ListaTransacciones from './components/ListaTransacciones';
import PeriodoMenu from './components/PeriodoMenu';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Appbar, Card} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Transacciones({navigation}) {
  const {transacciones} = useSelector(state => state.taecel);
  const {
    cargandoTransacciones,
    cargarTransacciones,
    periodo,
    totalTransacciones,
  } = useTransacciones();
  const netInfo = useNetInfo();
  const [selectedPeriodIndex, setSelectedPeriodIndex] = React.useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  useEffect(() => {
    if (netInfo?.isConnected) {
      cargarTransacciones(0);
    }
  }, [netInfo?.isConnected]);

  const handleSelectPeriodo = value => {
    setSelectedPeriodIndex(value);
    cargarTransacciones(value);
  };

  const getPeriodText = (index) => {
    switch(index) {
      case 0: return 'Semana en curso';
      case 1: return 'Semana pasada';
      case 2: return 'Semana antepasada';
      case 3: return 'Tres semanas atrás';
      default: return 'Seleccionar periodo';
    }
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      
      {/* HEADER PREMIUM */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title="Transacciones" 
          titleStyle={styles.appBarTitle} 
          color="white"
        />
      </Appbar.Header>

      <View style={styles.container}>
        {/* CARD DE PERIODO Y RESUMEN */}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryInfo}>
              <View style={styles.iconContainer}>
                <MaterialIcon name="calendar-clock" size={24} color="#0E1321" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>{getPeriodText(selectedPeriodIndex)}</Text>
                <Text style={styles.summaryPeriod}>
                  {periodo.inicial && periodo.final 
                    ? `${periodo.inicial} al ${periodo.final}` 
                    : 'Cargando fechas...'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Venta Total</Text>
                <Text style={styles.totalValue}>{totalTransacciones}</Text>
              </View>
              <PeriodoMenu
                cargando={cargandoTransacciones}
                onMenuItemPress={handleSelectPeriodo}
                trigger={
                  <TouchableOpacity style={styles.changePeriodBtn}>
                    <Text style={styles.changePeriodText}>Cambiar</Text>
                    <MaterialIcon name="chevron-down" size={20} color="#0E1321" />
                  </TouchableOpacity>
                }
              />
            </View>
          </Card.Content>
        </Card>

        {/* LISTADO DE TRANSACCIONES */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Historial Reciente</Text>
          <ListaTransacciones
            cargando={cargandoTransacciones}
            transacciones={transacciones}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 0,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#0E1321',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryContent: {
    padding: 16,
  },
  summaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryPeriod: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E1321',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  totalValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E1321',
  },
  changePeriodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  changePeriodText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#0E1321',
    marginRight: 4,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    paddingLeft: 4,
  },
});
