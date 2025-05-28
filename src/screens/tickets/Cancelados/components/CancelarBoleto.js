import React from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';
import {
  CustomModal,
  CustomAlert,
  CustomTicketInputGroup,
} from '../../../../components';
import {useModal} from '../../../../hooks';
import useCancelarBoleto from '../hooks/useCancelarBoleto';

export default function CancelarBoleto() {
  const {cargandoCancelados} = useSelector(state => state.cancelados);
  const modal = useModal();
  const cancelarBoletoHook = useCancelarBoleto(modal);
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

  return (
    <>
      <Text>Escanea el codígo QR</Text>
      {/* BOLETO INPUT GROUP AND SCANNER */}
      <CustomTicketInputGroup
        onSubmit={(_formik, data, capturedImageUri) => {
          cancelarBoletoHook.handleCancelar(_formik, data, capturedImageUri);
        }}
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
