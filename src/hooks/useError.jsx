import {Alert, Text} from 'react-native';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../errors';
import useLogout from './useLogout';
const {OUTDATED_APP_VERSION, DEACTIVATED_ACCOUNT} = ERROR_CODE_NAMES;
const {CONNECTING_DEVICE_FAILED, DEVICE_NOT_LINKED, PRINTING_NOT_POSSIBLE} =
  ERROR_NAMES;

export default function useError() {
  const {logout} = useLogout();

  const handleError = message => {
    if (
      message === DEVICE_NOT_LINKED ||
      message === OUTDATED_APP_VERSION ||
      message === DEACTIVATED_ACCOUNT
    ) {
      logout();
      return;
    }

    Alert.alert('Mensaje', message);
  };

  const handleErrorWithModal = (message, modal) => {
    if (
      message === DEVICE_NOT_LINKED ||
      message === OUTDATED_APP_VERSION ||
      message === DEACTIVATED_ACCOUNT
    ) {
      logout();
      return;
    }

    if (message === PRINTING_NOT_POSSIBLE) {
      modal.setConfig({open: false});
      return;
    }
    if (message === CONNECTING_DEVICE_FAILED) {
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
        error: <Text>verifica que la impresora este encendida</Text>,
      });
      return;
    }
    modal.setConfig({
      type: 'alert',
      alertTitle: 'Mensaje',
      contentType: 'error',
      action: 'error',
      showCancelBtn: false,
      confirmBtnText: 'Entendido',
      error: <Text>{message}</Text>,
    });
  };

  return {handleError, handleErrorWithModal};
}
