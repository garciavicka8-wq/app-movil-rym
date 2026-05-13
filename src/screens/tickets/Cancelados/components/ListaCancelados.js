import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Divider, List, Card} from 'react-native-paper';
import {useSelector} from 'react-redux';

export default function ListaCancelados() {
  const {cargandoCancelados, boletosCancelados} = useSelector(
    state => state.cancelados,
  );

  if (cargandoCancelados) {
    return (
      <View style={styles.container}>
        <Card style={styles.modernCard}>
          <List.Item
            title="Cargando cancelados"
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
            <Text style={styles.headerTitle}>Lista de Cancelados</Text>
            <Text style={styles.headerDescription}>Boletos cancelados de la semana en curso</Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        {boletosCancelados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay boletos cancelados esta semana</Text>
          </View>
        ) : (
          boletosCancelados.map((item, index) => (
            <React.Fragment key={item.numeroBoleto || index}>
              <List.Item
                title={`${item.fechaCancelacion} - ${item.horaCancelacion}`}
                titleStyle={styles.itemTitle}
                description={item.numeroBoleto}
                descriptionStyle={styles.itemDescription}
                left={() => <List.Icon icon="ticket-confirmation-outline" color="#34D399" />}
                right={() => (
                  <View style={styles.reembolsoContainer}>
                    <Text style={styles.reembolsoText}>{item.reembolso}</Text>
                  </View>
                )}
              />
              {index < boletosCancelados.length - 1 && <Divider style={styles.itemDivider} />}
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
  reembolsoContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  reembolsoText: {
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
