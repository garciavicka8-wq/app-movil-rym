import ThermalPrinterModule from 'react-native-thermal-printer';
import {Storage} from '../utils';

export function usePrinter() {
  const print = async (payload = '') => {
    try {
      const printer = getPrinterRegistered();
      if (printer === null) {
        throw new Error('PRINTER_NOT_REGISTERED');
      }
      await ThermalPrinterModule.printBluetooth({
        ip: printer.id,
        payload,
        // printerWidthMM: 50,
      });
    } catch ({message}) {
      if (message === 'Bluetooth Device Not Found') {
        // throw new Error('BLUETOOTH_DISABLED');
        throw new Error(
          'Verifica que el Bluetooth y la impresora esten encendidos y vinculados',
        );
      }
      throw new Error(message);
    }
  };

  const getPrinterRegistered = () => {
    return Storage.getItem('printer', true);
  };

  return {print, getPrinterRegistered};
}
