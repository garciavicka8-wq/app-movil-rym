import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Divider, List, Card} from 'react-native-paper';
import {useSelector} from 'react-redux';
import usePago from '../hooks/usePago';

export default function ListaPagos() {
  const {cargandoPagos, pagosRealizados} = useSelector(state => state.pagos);
  const pagosHook = usePago();

  useEffect(() => {
    pagosHook.obtenerPagos();
  }, []);

  if (cargandoPagos) {
    return (
      <View style={styles.container}>
        <Card style={styles.modernCard}>
          <List.Item
            title="Cargando pagos"
            titleStyle={styles.loadingTitle}
            description="..."
            left={() => <List.Icon icon="sync" color="#64748B" />}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.modernCard}>
        <View style={styles.headerContainer}>
          <View style={styles.headerIconBox}>
            <List.Icon icon="format-list-bulleted" color="#FFFFFF" />
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>Lista de Pagos</Text>
            <Text style={styles.headerDescription}>Pagos realizados de la semana en curso</Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        {pagosRealizados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay pagos realizados esta semana</Text>
          </View>
        ) : (
          pagosRealizados.map((item, index) => (
            <React.Fragment key={item.id || index}>
              <List.Item
                title={`${item.fechaPago} - ${item.horaPago}`}
                titleStyle={styles.itemTitle}
                description={item.numeroBoleto}
                descriptionStyle={styles.itemDescription}
                left={() => <List.Icon icon="cash-check" color="#10B981" />}
                right={() => (
                  <View style={styles.premioContainer}>
                    <Text style={styles.premioText}>{item.premio}</Text>
                  </View>
                )}
              />
              {index < pagosRealizados.length - 1 && <Divider style={styles.itemDivider} />}
            </React.Fragment>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 12,
    marginBottom: 20,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0E1321',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTextBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E1321',
  },
  headerDescription: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  loadingTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
  },
  itemTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemDescription: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  premioContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  premioText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981', // Emerald 500
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  itemDivider: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 15,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
