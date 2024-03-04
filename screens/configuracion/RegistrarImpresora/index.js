import React, {useEffect} from 'react';
import {StatusBar, Alert, Text, View} from 'react-native';
import {Appbar, List} from 'react-native-paper';
import {Container, Content, Footer} from '../../../components/Layout';
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

export default function RegistrarImpresora() {
  const {isFocused} = useCustomNavigation();
  const {scanning, devicesList, registeredDevice} = useSelector(
    state => state.bluetooth,
  );
  const bluetooth = useBluetooth();
  const printer = usePrinter();
  const thermalPrinter = useThermalPrinter();
  const dispatch = useDispatch();
  // START BLUETOOTH CONNECTION AND REQUEST PERMISSIONS
  useEffect(() => {
    setTimeout(() => {
      initBluetooth();
    }, 500);
    return () => {
      dispatch(setScanning(false));
    };
  }, []);
  // INITIALIZES BLUETOOTH
  const initBluetooth = async () => {
    try {
      await bluetooth.start();
      const _printer = printer.getPrinterRegistered();
      if (_printer !== null) {
        dispatch(registerDevice({..._printer}));
      }
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // HANDLE SCAN DEVICES
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

  const handlePrint = async () => {
    try {
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible) {
        await thermalPrinter.print(async function () {
          await Print.test();
        });
      }
    } catch ({message}) {
      console.log(message);
    }
  };

  return (
    <Container>
      {isFocused && <StatusBar backgroundColor={Colors.dark} />}
      <Content>
        <MessageIconBox
          message={`Para poder imprimir tickets, reportes y comprobantes necesitas registrar una impresora inalambrica y conectarla al dispositivo por medio del Bluetooth.`}
        />
        {registeredDevice !== null && (
          <List.Section>
            <List.Subheader>Dispositivo registrado</List.Subheader>
            <RegisteredDevice peripheral={registeredDevice} />
          </List.Section>
        )}
        {scanning && <Text>Buscando dispositivos...</Text>}
        {devicesList.length > 0 && (
          <List.Section>
            <List.Subheader>Dispositivos encontrados</List.Subheader>
            {devicesList.map(item => (
              <CustomListItem key={item.id} peripheral={item} />
            ))}
          </List.Section>
        )}
      </Content>
      <Footer>
        <View
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Appbar.Action icon="map-search" onPress={handleScanDevices} />
          {/* <Appbar.Action icon="printer" onPress={handlePrint} /> */}
        </View>
      </Footer>
    </Container>
  );
}

function RegisteredDevice({peripheral}) {
  const bluetooth = useBluetooth();
  // HANDLE RIGHT ICON PRESS
  const handleRightLongPress = async () => {
    Alert.alert('Eliminar', 'Deseas eliminar el registro de esta impresora?', [
      {text: 'No'},
      {
        text: 'Sí, Eliminar',
        onPress: async () => {
          // IF DEVICE IS CONNECTED THEN DISCONECT OTHERWISE DO NOTHING
          await bluetooth.disconnectDevice(peripheral, true);
        },
      },
    ]);
  };
  return (
    <List.Item
      onLongPress={handleRightLongPress}
      title={bluetooth.getDeviceName(peripheral)}
      description="para eliminar este registro manten presionado este mensaje"
      left={() => <List.Icon color="green" icon="printer" />}
      right={() => <List.Icon color="green" icon="check-underline-circle" />}
    />
  );
}

function CustomListItem({peripheral}) {
  const {connectingToDevice} = useSelector(state => state.bluetooth);
  const bluetooth = useBluetooth();

  return (
    <>
      <List.Item
        onPress={async () => {
          await bluetooth.connectAndRegisterDevice(peripheral);
        }}
        title={bluetooth.getDeviceName(peripheral)}
        description={connectingToDevice ? 'conectando...' : undefined}
        left={() => <List.Icon color="#000" icon="printer" />}
      />
    </>
  );
}
