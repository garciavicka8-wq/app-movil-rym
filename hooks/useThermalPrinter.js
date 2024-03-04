import {useState} from 'react';
import {Alert} from 'react-native';
import {APP_NAVIGATION} from '../constants';
import {ERROR_NAMES} from '../errors';
import {useAlert} from './useAlert';
import {useBluetooth} from './useBluetooth';
import {useCustomNavigation} from './useCustomNavigation';
import {usePrinter} from './usePrinter';

export function useThermalPrinter() {
  const [isPrinting, setIsPrinting] = useState(false);
  const navigation = useCustomNavigation();
  const bluetooth = useBluetooth();
  const printer = usePrinter();
  const alert = useAlert();

  const isPrintingPossible = async () => {
    try {
      const storage_printer = printer.getPrinterRegistered();
      if (storage_printer === null) {
        throw new Error(ERROR_NAMES.PRINTER_NOT_REGISTERED);
      }
      const isBluetoothEnabled = await bluetooth.isEnabled();
      if (!isBluetoothEnabled) {
        throw new Error(ERROR_NAMES.BLUETOOTH_NOT_ENABLED);
      }
      //   CONNECT TO DEVICE
      await bluetooth.connectToDevice(storage_printer);
      // await BM.connect(storage_printer.id);
      return true;
    } catch ({message}) {
      if (message === ERROR_NAMES.PRINTER_NOT_REGISTERED) {
        alert.show(message, function () {
          navigation.navigate(APP_NAVIGATION.SCREENS.REGISTRAR_IMPRESORA);
        });
        setIsPrinting(false);
        throw new Error('PRINTING_NOT_POSSIBLE');
      }
      if (message === ERROR_NAMES.BLUETOOTH_NOT_ENABLED) {
        alert.show(message, async function () {
          await bluetooth.enable();
        });
        setIsPrinting(false);
        throw new Error('PRINTING_NOT_POSSIBLE');
      }
      if (message === ERROR_NAMES.CONNECTING_DEVICE_FAILED) {
        setIsPrinting(false);
        throw new Error(ERROR_NAMES.CONNECTING_DEVICE_FAILED);
      }
      setIsPrinting(false);
    }
  };

  const print = async content => {
    try {
      if (!isPrinting) {
        setIsPrinting(true);
        await content();
        setIsPrinting(false);
      }
    } catch ({message}) {
      setIsPrinting(false);
      Alert.alert('Mensaje', 'UNKOWN ERROR: ' + message);
    }
  };

  return {print, isPrinting, isPrintingPossible};
}
