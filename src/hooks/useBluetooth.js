import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Alert,
  ToastAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {isLocationEnabled as isLocationOn} from 'react-native-device-info';
import {
  BluetoothManager as BM,
  BluetoothEscposPrinter as BEP,
} from 'tp-react-native-bluetooth-printer';
import {useDispatch, useSelector} from 'react-redux';
import {
  addDevice,
  registerDevice,
  setConnectingToDevice,
  setDevicesList,
  setScanning,
} from '../features/bluetooth/bluetoothSlice';
import {Storage} from '../utils';
import {ERROR_NAMES} from '../errors';
const PRINTER_NAMES = 'MTP-2.58k.58K'.split('.');

export default function useBluetooth() {
  const {devicesList, connectingToDevice, scanning} = useSelector(
    state => state.bluetooth,
  );
  const BleManagerModule = NativeModules.BleManager;
  const bleEmitter = new NativeEventEmitter(BleManagerModule);
  const dispatch = useDispatch();
  // INIT BLUETOOTH
  const start = async () => {
    try {
      await requestPermissions();
      await BleManager.enableBluetooth();
      await BleManager.scan([], 10);
      // ADD LISTENERS ON MOUNT
      // DISCOVER DEVICES
      const BleManagerDiscoverPeripheral = bleEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      );
      // HANDLE STOP SCAN
      const BleManagerStopScan = bleEmitter.addListener(
        'BleManagerStopScan',
        handleStopScan,
      );
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // REQUEST PERMISSIONS
  const requestPermissions = async () => {
    try {
      const status = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);
      return (
        status[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] == 'granted' &&
        status[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] == 'granted' &&
        status[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] == 'granted'
      );
    } catch (e) {
      console.error('Location Permssions Denied ', e);
      return false;
    }
  };
  // handle discovered peripheral
  const handleDiscoverPeripheral = peripheral => {
    const deviceRegistered = Storage.getItem('printer', true);
    if (deviceRegistered && deviceRegistered.id === peripheral.id) {
      return;
    }
    if (
      peripheral.advertising.isConnectable &&
      PRINTER_NAMES.includes(getDeviceName(peripheral))
    ) {
      dispatch(addDevice(peripheral));
    }
  };
  // HANDLE STOP SCAN
  const handleStopScan = () => {
    dispatch(setScanning(false));
  };
  //   CONNECT TO DEVICE
  const connectToDevice = async device => {
    try {
      const deviceConnected = await isDeviceConnected(device.id);
      if (deviceConnected) {
        return;
      }
      if (
        !connectingToDevice &&
        device &&
        device.name &&
        PRINTER_NAMES.includes(device.name)
      ) {
        dispatch(setConnectingToDevice(true));
        // await BleManager.connect(device.id);
        await BM.connect(device.id);
        dispatch(setConnectingToDevice(false));
      }
    } catch ({message}) {
      dispatch(setConnectingToDevice(false));
      throw new Error(ERROR_NAMES.CONNECTING_DEVICE_FAILED);
    }
  };
  //   REGISTER DEVICE
  const connectAndRegisterDevice = async device => {
    try {
      if (!connectingToDevice) {
        Alert.alert(
          'Conectar',
          `registrar y conectar a ${getDeviceName(device)}?`,
          [
            {text: 'cancelar'},
            {
              text: 'Si, conectar',
              onPress: async () => {
                try {
                  if (
                    device &&
                    device.name &&
                    PRINTER_NAMES.includes(device.name)
                  ) {
                    dispatch(setConnectingToDevice(true));
                    // await BleManager.connect(device.id);
                    await BM.connect(device.id);
                    dispatch(setConnectingToDevice(false));
                    Storage.setItem('printer', device, true);
                    dispatch(registerDevice({...device}));
                    const devicesListCopy = [...devicesList].filter(
                      item => item.id !== device.id,
                    );
                    dispatch(setDevicesList(devicesListCopy));
                    dispatch(setScanning(false));
                    await BleManager.stopScan();
                  }
                } catch (error) {
                  // console.log('failed connecting to the device', error);
                  ToastAndroid.show(
                    'No se pudo conectar con la impresora, asegurate de que esté encendida',
                    ToastAndroid.LONG,
                  );
                  dispatch(setConnectingToDevice(false));
                }
              },
            },
          ],
        );
      }
    } catch ({message}) {
      throw new Error(message);
    }
  };
  const scanDevices = async () => {
    try {
      const deviceRegistered = Storage.getItem('printer', true);
      const isEnabledLocation = await isLocationEnabled();
      if (!isEnabledLocation) {
        throw new Error(
          'Para localizar las impresoras cercanas debes activar la ubicación del dispositivo',
        );
      }
      if (deviceRegistered) {
        throw new Error(
          'para localizar nuevas impresoras debes eliminar la que tienes registrada.',
        );
      }
      if (!scanning) {
        BleManager.scan([], 10).then(() => {
          dispatch(setScanning(true));
          dispatch(setDevicesList([]));
        });
      }
    } catch ({message}) {
      throw new Error(message);
    }
  };
  //   IS BLUETOOTH ENABLED
  const isEnabled = async () => {
    try {
      const bleState = await BleManager.checkState();
      return bleState === 'on';
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // IS LOCATION ENABLED
  const isLocationEnabled = async () => {
    try {
      const isEnabledLocation = await isLocationOn();
      return isEnabledLocation;
    } catch ({message}) {
      throw new Error(message);
    }
  };
  //   GET PERIPHERAL NAME
  const getDeviceName = peripheral => {
    if (peripheral.advertising) {
      if (peripheral.advertising.localName) {
        return peripheral.advertising.localName;
      }
    }

    return peripheral.name || 'UNKNOWN';
  };
  //   IS DEVICE CONNECTED
  const isDeviceConnected = async deviceID => {
    try {
      const connectedDevices = await BleManager.getConnectedPeripherals();
      const deviceConnected = connectedDevices.find(
        item => item.id === deviceID,
      );
      return deviceConnected !== undefined;
    } catch ({message}) {
      throw new Error(message);
    }
  };
  //   DISCONECT DEVICE
  const disconnectDevice = async (device, clearFromStorage = false) => {
    try {
      await BM.unpair(device.id);
      // console.log('unpaired');
      if (clearFromStorage) {
        Storage.removeItem('printer');
        dispatch(registerDevice(null));
        dispatch(setDevicesList([{...device}, ...devicesList]));
      }
    } catch ({message}) {
      throw new Error(message);
    }
  };
  //   ENABLE BLUETOOTH
  const enable = async () => {
    await BleManager.enableBluetooth();
  };

  return {
    start,
    scanDevices,
    connectToDevice,
    disconnectDevice,
    isEnabled,
    isDeviceConnected,
    getDeviceName,
    connectAndRegisterDevice,
    enable,
    isLocationEnabled,
  };
}
