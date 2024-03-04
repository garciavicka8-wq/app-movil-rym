import React, {useState} from 'react';
import {Alert, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  CustomModal,
  CustomAlert,
  CustomTicketInputGroup,
} from '../../../../components';
import {agregarBoletoCancelado} from '../../../../features/tickets/cancelados/canceladosSlice';
import {establecerCredito} from '../../../../features/credito/creditoSlice';
import {
  useLogout,
  useModal,
  usePrinter,
  useThermalPrinter,
} from '../../../../hooks';
import {cancelTicket} from '../../../../services/tickets';
import {Money, Print, uuid} from '../../../../utils';
import {agregarRegistroAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';

export default function CancelarBoleto() {
  const {cargandoCancelados} = useSelector(state => state.cancelados);
  const [cancelandoTicket, setCancelandoTicket] = useState(false);
  const modal = useModal();
  const printer = usePrinter();
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
  };
  //   COMPROBAR BOLETO
  const handleComprobarBoleto = async (_formik, data) => {
    try {
      // VERIFICAR CONEXION
      if (!netInfo?.isConnected) {
        modal.setConfig({
          open: false,
        });
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Comprobando boleto',
      });
      // CHECK IF BLUETOOTH IS ENABLED AND PRINTER IS REGISTERED AND CONNECTED
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible && !cancelandoTicket) {
        setCancelandoTicket(true);
        const numeroBoleto =
          data.primero + '-' + data.segundo + '-' + data.tercero;
        const boletoCancelado = await cancelTicket(numeroBoleto);
        // SI SE CANCELO CORRECTAMENTE
        if (boletoCancelado) {
          // IMPRIMIR COMPROBANTE CANCELACION
          await thermalPrinter.print(async function () {
            await Print.canceledTicket(boletoCancelado);
          });
          modal.setConfig({
            type: 'alert',
            alertTitle: 'Boleto cancelado',
            contentType: 'mensaje',
            action: 'mensaje',
            content: <Text>{Money(boletoCancelado.reembolso)}</Text>,
            showCancelBtn: false,
          });
          dispatch(establecerCredito(boletoCancelado.nuevoSaldo));
          dispatch(
            agregarRegistroAlMomento({
              id: uuid(),
              fecha: boletoCancelado.fechaCancelacion,
              numeroBoleto: boletoCancelado.numeroBoleto,
              hora: boletoCancelado.horaCancelacion,
              total: -Math.abs(boletoCancelado.reembolso),
              tipo: 'cancelado',
            }),
          );
          dispatch(agregarBoletoCancelado(boletoCancelado));
          _formik.handleReset();
        }
        setCancelandoTicket(false);
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
      _formik.handleReset();
      setCancelandoTicket(false);
    }
  };

  return (
    <>
      <Text>Escanea el codígo QR</Text>
      {/* BOLETO INPUT GROUP AND SCANNER */}
      <CustomTicketInputGroup
        onSubmit={handleComprobarBoleto}
        disableSubmit={cargandoCancelados}
      />
      <CustomAlert
        text="Conserve el ticket una vez cancelado ya que podria solicitarse para su recolección"
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
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}
