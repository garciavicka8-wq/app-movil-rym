import {Storage} from '../utils';

export function usePrinter() {
  const print = async (payload = '') => {
    try {
    } catch ({message}) {}
  };

  const getPrinterRegistered = () => {
    return Storage.getItem('printer', true);
  };

  return {print, getPrinterRegistered};
}
