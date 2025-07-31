import {useEffect, useState} from 'react';
import {Alert, Text} from 'react-native';
import {Money, Print, Storage, Utils} from '../../../../utils';
import {registrarPago, verifyTicket, obtenerPremiosPagados} from '../services';
import {useLogout, useThermalPrinter} from '../../../../hooks';
import {useDispatch} from 'react-redux';
import {agregarRegistroAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {
  agregarPagoRegistrado,
  setCargandoPagos,
  setPagosRealizados,
} from '../../../../features/tickets/pagos/pagosSlice';
import {establecerCredito} from '../../../../features/credito/creditoSlice';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../errors';

export default function usePago(modal) {
  const [registrando, setRegistrando] = useState(false);
  const [comprobandoTicket, setComprobandoTicket] = useState(false);
  const [premio, setPremio] = useState(null);
  const [numeroBoleto, setNumeroBoleto] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const thermalPrinter = useThermalPrinter();
  const [limpiarInput, setLimpiarInput] = useState(null);
  const dispatch = useDispatch();
  const {logout} = useLogout();

  useEffect(() => {
    return () => {
      dispatch(setCargandoPagos(false));
    };
  }, []);

  const obtenerPagos = async () => {
    try {
      dispatch(setCargandoPagos(true));
      const data = await obtenerPremiosPagados();
      dispatch(setPagosRealizados(data));
      dispatch(setCargandoPagos(false));
    } catch ({message}) {
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      Alert.alert('Mensaje', message);
      dispatch(setCargandoPagos(false));
    }
  };

  const comprobarBoleto = async (
    numeroTicket,
    capturedImageUri,
    resetInputField,
  ) => {
    if (comprobandoTicket) return;
    setComprobandoTicket(true);
    modal.setConfig({
      open: true,
      type: 'progress',
      progressTitle: 'Comprobando boleto',
    });

    try {
      setNumeroBoleto(numeroTicket);
      const res = await verifyTicket(numeroTicket);
      //   SI EL BOLETO NO ES GANADOR
      if (!res.esGanador) {
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'mensaje',
          action: 'mensaje',
          content: <Text>Boleto no ganador</Text>,
          showCancelBtn: false,
          confirmBtnText: 'entendido',
        });
        Utils.deleteCapturedImage(capturedImageUri);
      }
      //   SI EL BOLETO ES GANADOR
      if (res.esGanador) {
        setLimpiarInput(() => resetInputField);
        setPhotoUri(capturedImageUri);
        setPremio(res.premio);
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Boleto Ganador',
          contentType: 'pagar',
          action: 'pagar',
          content: <Text>¿Es posible pagar {Money(res.premio)} ?</Text>,
          showCancelBtn: true,
          confirmBtnText: 'Sí, pagar',
        });
      }
      setComprobandoTicket(false);
    } catch ({message}) {
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        error: <Text>{message}</Text>,
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
      });
      setComprobandoTicket(false);
      setNumeroBoleto(null);
      Utils.deleteCapturedImage(capturedImageUri);
      setLimpiarInput(null);
      setComprobandoTicket(false);
    }
  };

  const registrar = async () => {
    if (registrando) return;
    setRegistrando(true);
    modal.setConfig({
      open: true,
      type: 'progress',
      progressTitle: 'Registrando pago',
    });
    try {
      // Verifica si la impresión es posible y si no se está registrando un pago
      if (!(await thermalPrinter.isPrintingPossible())) return;

      const usuarioLocalStorage = Storage.getUser();
      const {pago_registrado, saldo_nuevo} = await registrarPago(
        usuarioLocalStorage.usuario,
        numeroBoleto,
        premio,
        photoUri,
      );
      //  SI SE REGISTRO CORRECTAMENTE
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Pago Registrado',
        contentType: 'mensaje',
        action: 'mensaje',
        showCancelBtn: false,
        confirmBtnText: 'Aceptar',
        content: <Text>por favor pague al cliente {Money(premio)}</Text>,
      });

      // IMPRIMIR PAGO
      await thermalPrinter.print(() => Print.paymentTicket(pago_registrado));

      dispatch(
        agregarRegistroAlMomento({
          id: pago_registrado.id,
          fecha: pago_registrado.fechaPago,
          numeroBoleto: pago_registrado.numeroBoleto,
          hora: pago_registrado.horaPago,
          total: -Math.abs(pago_registrado.premio),
          tipo: 'pago',
        }),
      );

      dispatch(agregarPagoRegistrado(pago_registrado));
      dispatch(establecerCredito(saldo_nuevo));
    } catch (error) {
      handlePaymentError(error);
    } finally {
      if (limpiarInput) {
        limpiarInput();
      }
      setRegistrando(false);
      setPremio(0);
      setPhotoUri(null);
      setNumeroBoleto(null);
      setLimpiarInput(null);
    }
  };

  const handlePaymentError = ({message}) => {
    const errorConfigs = {
      DEVICE_NOT_LINKED: () => logout(),
      PRINTING_NOT_POSSIBLE: () => modal.setConfig({open: false}),
      [ERROR_CODE_NAMES.OUTDATED_APP_VERSION]: () => logout(),
      [ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT]: () => logout(),
      [ERROR_NAMES.CONNECTING_DEVICE_FAILED]: () =>
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          confirmBtnText: 'Entendido',
          error: <Text>Verifica que la impresora esté encendida</Text>,
        }),
      default: () =>
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          confirmBtnText: 'Entendido',
          error: <Text>{message}</Text>,
        }),
    };

    (errorConfigs[message] || errorConfigs.default)();
  };

  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
    Utils.deleteCapturedImage(photoUri);
    if (limpiarInput) {
      limpiarInput();
    }
  };

  return {obtenerPagos, comprobarBoleto, registrar, handleModalCancel};
}
