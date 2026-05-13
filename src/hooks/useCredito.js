import {useDispatch} from 'react-redux';
import {
  setCargandoCredito,
  setCreditoDisponible,
  setFechaCredito,
  setMostrarCredito,
} from '../features/credito/creditoSlice';
import {Moment, Utils} from '../utils';
import {useLogout} from './';
import {ERROR_CODE_NAMES} from '../errors';
import {requestRymAPI} from '../services/http';

export default function useCredito() {
  const dispatch = useDispatch();
  const {logout} = useLogout();

  const obtenerCreditoApi = async () => {
    try {
      dispatch(setMostrarCredito(true));
      dispatch(setCargandoCredito(true));
      const hasSessionExpired = Utils.hasSessionExpired();

      if (!hasSessionExpired) {
        const response = await requestRymAPI('credits/balance', {}, true, 'GET');
        const {saldo, server_date} = response.data;

        dispatch(setCreditoDisponible(saldo));
        dispatch(setFechaCredito(Moment(server_date).format('DD/MM/YYYY')));

        dispatch(setCargandoCredito(false));
        setTimeout(() => {
          dispatch(setMostrarCredito(false));
        }, 5000);
      } else {
        logout();
      }
      dispatch(setCargandoCredito(false));
    } catch (error) {
      dispatch(setCargandoCredito(false));
      let message = 'Ocurrió un error al consultar el crédito.';
      if (error.response?.data?.error_message) {
        message = error.response.data.error_message;
      } else if (error.message) {
        message = error.message;
      }

      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT ||
        message == 'Sesión finalizada. Vuelve a iniciar sesión.'
      ) {
        logout();
        return;
      }
      alert(message);
    }
  };

  // Refresca el saldo desde el servidor tras una transacción
  const restarCredito = async () => {
    try {
      const response = await requestRymAPI('credits/balance', {}, true, 'GET');
      dispatch(setCreditoDisponible(response.data.saldo));
    } catch (_) {}
  };

  return {
    obtenerCreditoApi,
    restarCredito,
  };
}
