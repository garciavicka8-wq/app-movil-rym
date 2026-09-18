import React, {useCallback, useState} from 'react';
import {View, StyleSheet, Text, FlatList, RefreshControl} from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Modal,
  Portal,
  ActivityIndicator,
} from 'react-native-paper';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors, Moment, Money, Storage} from '../../../utils';
import {misSolicitudesSoporteApi} from '../../../services/soporte';

const TITULOS = {
  diferencia_premio: 'Diferencia para pago de premio',
  insumos: 'Solicitud de insumos',
};

const ESTADOS = {
  pendiente: {label: 'Pendiente', color: '#F59E0B'},
  en_proceso: {label: 'En proceso', color: '#3B82F6'},
  resuelta: {label: 'Resuelta', color: '#22C55E'},
  rechazada: {label: 'Rechazada', color: '#EF4444'},
};

export default function SoporteHistorial() {
  const navigation = useNavigation();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      const usuario = Storage.getUser();
      const data = await misSolicitudesSoporteApi(usuario.usuario);
      setSolicitudes(data || []);
    } catch (error) {
      // Silencioso: la pantalla solo muestra "sin solicitudes" si falla
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSolicitudes();
    }, [fetchSolicitudes]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const handlePress = item => {
    if (
      item.tipo === 'diferencia_premio' &&
      item.estado === 'resuelta' &&
      item.respuesta_payload
    ) {
      setSeleccionada(item);
    }
  };

  const renderItem = ({item}) => {
    const estado = ESTADOS[item.estado] || {
      label: item.estado,
      color: '#94A3B8',
    };
    return (
      <Card style={styles.card} onPress={() => handlePress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {TITULOS[item.tipo] || item.tipo}
            </Text>
            <Chip
              style={{backgroundColor: estado.color}}
              textStyle={styles.chipText}>
              {estado.label}
            </Chip>
          </View>
          {item.detalle ? (
            <Text style={styles.cardDetalle}>"{item.detalle}"</Text>
          ) : null}
          {item.respuesta && item.tipo === 'insumos' ? (
            <Text style={styles.cardRespuesta}>
              Respuesta: {item.respuesta}
            </Text>
          ) : null}
          {item.tipo === 'diferencia_premio' && item.estado === 'resuelta' && (
            <Text style={styles.verDetalle}>
              Toca para ver tu código de retiro →
            </Text>
          )}
          {item.updated_at && (
            <Text style={styles.cardActualizado}>
              Actualizado: {Moment(item.updated_at).format('DD/MM/YYYY HH:mm')}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content
          color="white"
          titleStyle={styles.appBarTitle}
          title="Mis solicitudes"
        />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Todavía no has enviado ninguna solicitud de soporte.
            </Text>
          }
        />
      )}

      <Portal>
        <Modal
          visible={!!seleccionada}
          onDismiss={() => setSeleccionada(null)}
          contentContainerStyle={styles.modalContent}>
          {seleccionada && <RetiroCard solicitud={seleccionada} />}
        </Modal>
      </Portal>
    </View>
  );
}

function RetiroCard({solicitud}) {
  const {
    banco,
    clave_retiro: claveRetiro,
    codigo_seguridad: codigoSeguridad,
    monto,
  } = solicitud.respuesta_payload || {};
  const claveFormateada =
    (claveRetiro || '').match(/.{1,4}/g)?.join('  ') || claveRetiro;
  const fecha = solicitud.resuelta_at ? new Date(solicitud.resuelta_at) : null;

  return (
    <View style={styles.retiroCard}>
      <Text style={styles.retiroBanco}>🏦 {banco}</Text>

      <Text style={styles.retiroLabel}>Clave del retiro (12 dígitos):</Text>
      <Text style={styles.retiroClave}>{claveFormateada}</Text>

      <Text style={styles.retiroLabel}>Código de seguridad (4 dígitos)</Text>
      <Text style={styles.retiroCodigo}>{codigoSeguridad}</Text>

      <Text style={styles.retiroNetoLabel}>Neto a Recibir</Text>
      <Text style={styles.retiroNeto}>{Money(Number(monto))}</Text>

      {fecha && (
        <Text style={styles.retiroFecha}>
          {fecha.toLocaleDateString()} {fecha.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flexShrink: 1,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  cardDetalle: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardRespuesta: {
    fontSize: 14,
    color: '#1E293B',
    marginTop: 6,
  },
  verDetalle: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  cardActualizado: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 15,
  },
  modalContent: {
    marginHorizontal: 24,
  },
  retiroCard: {
    backgroundColor: '#DCEEFB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  retiroBanco: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  retiroLabel: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
  },
  retiroClave: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 2,
    marginTop: 4,
  },
  retiroCodigo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginTop: 4,
  },
  retiroNetoLabel: {
    fontSize: 16,
    color: '#1E293B',
    marginTop: 16,
  },
  retiroNeto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  retiroFecha: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 16,
  },
});
