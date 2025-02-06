import React, {useState} from 'react';
import {Alert, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal} from '../../../../components';
import {verifyTicket, payPrize} from '../../../../services/tickets';
import {useLogout, useModal, useThermalPrinter} from '../../../../hooks';
import {Money, Print} from '../../../../utils';
import {agregarPagoRegistrado} from '../../../../features/tickets/pagos/pagosSlice';
import {CustomTicketInputGroup, CustomAlert} from '../../../../components';
import {agregarRegistroAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {establecerCredito} from '../../../../features/credito/creditoSlice';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../errors';
import {verifyUserAccountStatus} from '../../../../services/reports';
import {useNetInfo} from '@react-native-community/netinfo';
import UploadImageModal from '../../../../components/UploadImageModal';
import {MAX_AMOUNT_TO_PAY_WITHOUT_CAPTURE} from '../../../../constants';

export default function RealizarPago() {
  const {cargandoPagos} = useSelector(state => state.pagos);
  const [formik, setFormik] = useState(null);
  const [boletoGanador, setBoletoGanador] = useState(null);
  const [comprobandoTicket, setComprobandoTicket] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [capturarBoleto, setCapturarBoleto] = useState(false);
  const modal = useModal();
  const thermalPrinter = useThermalPrinter();
  const dispatch = useDispatch();
  const {logout} = useLogout();
  const netInfo = useNetInfo();
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (['error', 'mensaje'].includes(modal.config.action)) {
      handleModalCancel();
    }
    if (modal.config.action === 'pagar') {
      if (boletoGanador.premio > MAX_AMOUNT_TO_PAY_WITHOUT_CAPTURE) {
        handleCapturarBoleto();
      } else {
        handlePagarPremio();
      }
    }
  };
  //   COMPROBAR BOLETO
  const _comprobarBoleto = async (_formik, data) => {
    try {
      // VERIFICAR CONEXION
      if (!netInfo?.isConnected) {
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Comprobando boleto',
      });
      if (!comprobandoTicket) {
        setComprobandoTicket(true);
        await verifyUserAccountStatus();
        const numeroBoleto =
          data.primero + '-' + data.segundo + '-' + data.tercero;
        const res = await verifyTicket(numeroBoleto);
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
        }
        //   SI EL BOLETO ES GANADOR
        if (res.esGanador) {
          const newBoleto = {...res.boleto, premio: res.premio, capturaUrl: ''};
          // sound.play();
          setBoletoGanador(newBoleto);
          setFormik(_formik);
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
      }
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
    }
  };
  //   PAGAR PREMIO
  const handlePagarPremio = async () => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Registrando pago',
      });
      // Verifica si la impresión es posible y si no se está registrando un pago
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (!isPrintingPossible || registrandoPago) return;
      // Registrar pago
      registrarPago(boletoGanador);
    } catch ({message}) {
      handlePaymentError({message});
    } finally {
      setRegistrandoPago(false);
    }
  };
  // CAPTURAR BOLETO
  const handleCapturarBoleto = async () => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Registrando pago',
      });
      // Verifica si la impresión es posible y si no se está registrando un pago
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (!isPrintingPossible || registrandoPago) return;
      // Se muestra el modal de la camara
      setCapturarBoleto(true);
    } catch ({message}) {
      handlePaymentError({message});
    } finally {
      setRegistrandoPago(false);
    }
  };
  // TOMAR CAPTURA BOLETO
  const handleOnCaptureUploaded = async imageUrl => {
    setCapturarBoleto(false);
    registrarPago({...boletoGanador, capturaUrl: imageUrl});
  };
  // Manejo de errores separado para mayor claridad y reutilización
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
  // Se cierra el modal de la camara
  const handleCloseCameraModal = () => {
    modal.setConfig({open: false});
    setCapturarBoleto(false);
  };

  const registrarPago = async ticket => {
    setRegistrandoPago(true);
    try {
      const pagoRegistrado = await payPrize(ticket);
      //  SI SE REGISTRO CORRECTAMENTE
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Pago Registrado',
        contentType: 'mensaje',
        action: 'mensaje',
        showCancelBtn: false,
        confirmBtnText: 'Aceptar',
        content: <Text>por favor pague al cliente {Money(ticket.premio)}</Text>,
      });

      // IMPRIMIR PAGO
      await thermalPrinter.print(() => Print.paymentTicket(pagoRegistrado));

      dispatch(
        agregarRegistroAlMomento({
          id: pagoRegistrado.id,
          fecha: pagoRegistrado.fechaPago,
          numeroBoleto: pagoRegistrado.numeroBoleto,
          hora: pagoRegistrado.horaPago,
          total: -Math.abs(pagoRegistrado.premio),
          tipo: 'pago',
        }),
      );

      dispatch(agregarPagoRegistrado(pagoRegistrado));
      dispatch(establecerCredito(pagoRegistrado.nuevoSaldo));

      formik.handleReset();
    } catch ({message}) {
      handlePaymentError(message);
    } finally {
      setRegistrandoPago(false);
    }
  };

  return (
    <>
      <Text>Escanea el codígo QR</Text>
      {/* BOLETO INPUT GROUP AND SCANNER */}
      <CustomTicketInputGroup
        parentComponent="pagos"
        onSubmit={_comprobarBoleto}
        disableSubmit={cargandoPagos}
      />
      <CustomAlert
        text="Conserve el ticket una vez realizado el pago ya que podria solicitarse para su recolección"
        type="danger"
      />
      {/* MODAL */}
      <CustomModal
        open={modal.config.open}
        type={modal.config.type}
        progressTitle={modal.config.progressTitle}
        alertTitle={modal.config.alertTitle}
        showCancelButton={modal.config.showCancelBtn}
        cancelButtonText={modal.config.cancelBtnText}
        confirmButtonText={modal.config.confirmBtnText}
        showConfirmBtn={modal.config.showConfirmBtn}
        onCancel={handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'pagar' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
      {/* CAPTURA BOLETO COMPONENT */}
      {capturarBoleto && (
        <UploadImageModal
          onUploaded={handleOnCaptureUploaded}
          onClose={handleCloseCameraModal}
          type={'prize-ticket'}
        />
      )}
    </>
  );
}
