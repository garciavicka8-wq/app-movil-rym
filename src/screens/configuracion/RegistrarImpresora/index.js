import React, {useEffect, useLayoutEffect} from 'react';
import {Alert, Text, View, StyleSheet, ScrollView} from 'react-native';
import {Appbar, List, Button, ActivityIndicator} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import {useDispatch, useSelector} from 'react-redux';
import {
  registerDevice,
  setScanning,
} from '../../../features/bluetooth/bluetoothSlice';
import {
  useBluetooth,
  useCustomNavigation,
  usePrinter,
  useThermalPrinter,
} from '../../../hooks';
import {Colors, Print} from '../../../utils';
import MessageIconBox from '../../../components/MessageIconBox';
import CustomStatusBar from '../../../components/CustomStatusBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegistrarImpresora({navigation}) {
  const {isFocused} = useCustomNavigation();
  const {scanning, devicesList, registeredDevice} = useSelector(
    state => state.bluetooth,
  );
  const bluetooth = useBluetooth();
  const printer = usePrinter();
  const thermalPrinter = useThermalPrinter();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    setTimeout(() => {
      initBluetooth();
    }, 500);
    return () => {
      dispatch(setScanning(false));
    };
  }, []);

  const initBluetooth = async () => {
    try {
      await bluetooth.start();
      const _printer = printer.getPrinterRegistered();
      if (_printer !== null) {
        dispatch(registerDevice({..._printer}));
      }
    } catch ({message}) {
      console.log('Error init bluetooth:', message);
    }
  };

  const handleScanDevices = async () => {
    try {
      const isBluetoothEnabled = await bluetooth.isEnabled();
      if (!isBluetoothEnabled) {
        await bluetooth.enable();
        return;
      }
      await bluetooth.scanDevices();
    } catch ({message}) {
      Alert.alert('Mensaje', message);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Registrar Impresora" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <MessageIconBox
            message={`Para poder imprimir tickets, reportes y comprobantes necesitas registrar una impresora inalámbrica y conectarla por Bluetooth.`}
          />
          
          {registeredDevice !== null && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dispositivo Registrado</Text>
              <View style={styles.card}>
                <RegisteredDevice peripheral={registeredDevice} />
              </View>
            </View>
          )}

          {(registeredDevice === null || scanning || devicesList.length > 0) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {scanning ? 'Buscando dispositivos...' : 'Dispositivos Cercanos'}
                </Text>
                {scanning && <ActivityIndicator animating={true} color="#3B82F6" size={20} />}
              </View>

              {devicesList.length > 0 ? (
                <View style={styles.cardList}>
                  {devicesList.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <CustomListItem peripheral={item} />
                      {index < devicesList.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </View>
              ) : !scanning && registeredDevice === null && (
                <View style={styles.emptyState}>
                  <Icon name="bluetooth-off" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No se encontraron impresoras.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.fixedFooter}>
          <Button
            mode="contained"
            buttonColor="#0E1321"
            style={styles.scanButton}
            labelStyle={styles.scanButtonLabel}
            icon="map-search"
            loading={scanning}
            disabled={scanning}
            onPress={handleScanDevices}>
            BUSCAR IMPRESORAS
          </Button>
        </View>
      </Container>
    </View>
  );
}

function RegisteredDevice({peripheral}) {
  const bluetooth = useBluetooth();
  const handleRightLongPress = async () => {
    Alert.alert('Eliminar Registro', '¿Deseas eliminar el registro de esta impresora?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await bluetooth.disconnectDevice(peripheral, true);
        },
      },
    ]);
  };
  return (
    <List.Item
      onLongPress={handleRightLongPress}
      title={bluetooth.getDeviceName(peripheral)}
      titleStyle={styles.itemTitle}
      description="Mantén presionado para eliminar el registro."
      descriptionStyle={styles.itemDescription}
      left={() => (
        <View style={[styles.iconBox, {backgroundColor: '#DCFCE7'}]}>
          <Icon name="printer-check" size={24} color="#15803D" />
        </View>
      )}
      right={() => <Icon name="check-circle" size={24} color="#15803D" style={{alignSelf: 'center'}} />}
    />
  );
}

function CustomListItem({peripheral}) {
  const {connectingToDevice} = useSelector(state => state.bluetooth);
  const bluetooth = useBluetooth();

  return (
    <List.Item
      onPress={async () => {
        await bluetooth.connectAndRegisterDevice(peripheral);
      }}
      title={bluetooth.getDeviceName(peripheral)}
      titleStyle={styles.itemTitle}
      description={connectingToDevice ? 'Conectando...' : 'Toca para conectar'}
      descriptionStyle={styles.itemDescription}
      left={() => (
        <View style={styles.iconBox}>
          <Icon name="printer" size={24} color="#64748B" />
        </View>
      )}
      right={() => <Icon name="chevron-right" size={24} color="#CBD5E1" style={{alignSelf: 'center'}} />}
    />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 15,
  },
  itemTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  itemDescription: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  scanButton: {
    borderRadius: 16,
    paddingVertical: 8,
  },
  fixedFooter: {
    padding: 20,
    backgroundColor: Colors.lightBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  scanButtonLabel: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '500',
  },
});
