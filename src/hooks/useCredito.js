import {useDispatch} from 'react-redux';
import {
  setCargandoCredito,
  setCreditoDisponible,
  setFechaCredito,
  setMostrarCredito,
} from '../features/credito/creditoSlice';
import {obtenerCreditoDisponible} from '../services/tickets';
import Database from '../database';
import {Moment, Storage, Utils} from '../utils';
import {useLogout} from './';
import {ERROR_CODE_NAMES} from '../errors';
import {verifyUserAccountStatus} from '../services/reports';
import {DATABASE_TABLES} from '../services/constants';
import {requestRymAPI} from '../services/http';

export default function useCredito() {
  const dispatch = useDispatch();
  const {logout} = useLogout();

  const obtenerCredito = async () => {
    try {
      dispatch(setMostrarCredito(true));
      dispatch(setCargandoCredito(true));
      const hasSessionExpired = Utils.hasSessionExpired();
      if (!hasSessionExpired) {
        await verifyUserAccountStatus();
        const credito = await obtenerCreditoDisponible();
        const timestamp = await Database.getServerDate();
        dispatch(setCreditoDisponible(credito));
        dispatch(setFechaCredito(Moment(timestamp).format('DD/MM/YYYY')));
        dispatch(setCargandoCredito(false));
        setTimeout(() => {
          dispatch(setMostrarCredito(false));
        }, 5000);
      } else {
        console.log('session expired');
        logout();
      }
      dispatch(setCargandoCredito(false));
    } catch ({message}) {
      console.log('message: ', message);
      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      alert(message);
    }
  };

  const obtenerCreditoApi = async () => {
    try {
      dispatch(setMostrarCredito(true));
      dispatch(setCargandoCredito(true));
      const hasSessionExpired = Utils.hasSessionExpired();
      
      if (!hasSessionExpired) {
        // En lugar de llamar a Firebase, llamamos a la API
        const response = await requestRymAPI('credits/balance', {}, true, 'GET');

        const { saldo, server_date } = response.data;

        console.log('saldo: ', saldo);
        console.log('server_date: ', server_date);
        
        dispatch(setCreditoDisponible(saldo));
        dispatch(setFechaCredito(Moment(server_date).format('DD/MM/YYYY')));
        
        dispatch(setCargandoCredito(false));
        setTimeout(() => {
          dispatch(setMostrarCredito(false));
        }, 5000);
      } else {
        console.log('session expired');
        logout();
      }
      dispatch(setCargandoCredito(false));
    } catch (error) {
      dispatch(setCargandoCredito(false));
      let message = 'Ocurrió un error al consultar el crédito.';
      if (error.response && error.response.data && error.response.data.error_message) {
        message = error.response.data.error_message;
      } else if (error.message) {
        message = error.message;
      }
      
      console.log('message: ', message);
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

  const restarCredito = async amount => {
    try {
      const user = Storage.getUser();
      const credito = await Database.getItem(
        DATABASE_TABLES.CREDITS,
        'usuario',
        user.usuario,
      );
      if (credito) {
        // RESTAMOS EL MONTO DE LA TRANSACCION AL CREDITO DISPONIBLE
        const saldoNuevo = credito.saldo - amount;
        await Database.update(DATABASE_TABLES.CREDITS, credito.key, {
          saldo: saldoNuevo <= 0 ? 0 : saldoNuevo,
        });
        dispatch(setCreditoDisponible(saldoNuevo <= 0 ? 0 : saldoNuevo));
      }
    } catch ({message}) {
      throw new Error(message);
    }
  };

  return {
    obtenerCredito,
    obtenerCreditoApi,
    restarCredito,
  };
}
