import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Card} from 'react-native-paper';
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
    <View style={styles.container}>
      <Card style={styles.modernCard}>
        <Card.Content>
          <Text style={styles.instructionText}>Escanea o ingresa el código QR</Text>
          {/* BOLETO INPUT GROUP AND SCANNER */}
          <CustomTicketInputGroup
            onSubmit={async (data, capturedImageUri, resetInputField) => {
              await cancelarBoletoHook.handleCancelar(data, capturedImageUri);
              resetInputField();
            }}
            disableSubmit={cargandoCancelados}
          />
          <View style={styles.alertContainer}>
            <CustomAlert
              text="Conserve el ticket una vez cancelado ya que podría solicitarse para su recolección."
              type="danger"
            />
          </View>
        </Card.Content>
      </Card>
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 12,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  instructionText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  alertContainer: {
    marginTop: 15,
  },
});
