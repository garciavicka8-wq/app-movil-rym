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

export default function RealizarPago() {
  const {cargandoPagos} = useSelector(state => state.pagos);
  const [formik, setFormik] = useState(null);
  const [boletoGanador, setBoletoGanador] = useState(null);
  const [comprobandoTicket, setComprobandoTicket] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);
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
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'pagar') {
      handlePagarPremio();
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
          const newBoleto = {...res.boleto, premio: res.premio};
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
      // CHECK IF BLUETOOTH IS ENABLED AND PRINTER IS REGISTERED AND CONNECTED
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible && !registrandoPago) {
        setRegistrandoPago(true);
        const pagoRegistrado = await payPrize(boletoGanador);
        //  SI SE REGISTRO CORRECTAMENTE
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Pago Registrado',
          contentType: 'mensaje',
          action: 'mensaje',
          showCancelBtn: false,
          confirmBtnText: 'Aceptar',
          content: (
            <Text>
              por favor pague al cliente {Money(boletoGanador.premio)}
            </Text>
          ),
        });
        // IMPRIMIR PAGO
        await thermalPrinter.print(async function () {
          await Print.paymentTicket(pagoRegistrado);
        });
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
        // ACTUIALIZAMOS CREDITO
        dispatch(establecerCredito(pagoRegistrado.nuevoSaldo));
        formik.handleReset();
        setRegistrandoPago(false);
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
      if (message === 'PRINTING_NOT_POSSIBLE') {
        modal.setConfig({open: false});
        return;
      }
      if (message === ERROR_NAMES.CONNECTING_DEVICE_FAILED) {
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
      formik.handleReset();
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
    </>
  );
}
