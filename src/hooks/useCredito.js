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
    restarCredito,
  };
}
