import React from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';
import {CustomModal} from '../../../../components';
import {useModal} from '../../../../hooks';
import {CustomTicketInputGroup, CustomAlert} from '../../../../components';
import usePago from '../hooks/usePago';

export default function RealizarPago() {
  const {cargandoPagos} = useSelector(state => state.pagos);
  const modal = useModal();
  const pagoHook = usePago(modal);
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (['error', 'mensaje'].includes(modal.config.action)) {
      pagoHook.handleModalCancel();
    }
    if (modal.config.action === 'pagar') {
      pagoHook.registrar();
    }
  };
  //   COMPROBAR BOLETO
  const _comprobarBoleto = (_formik, data, capturedImageUri) => {
    pagoHook.comprobarBoleto(_formik, data, capturedImageUri);
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
        onCancel={pagoHook.handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'pagar' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}
