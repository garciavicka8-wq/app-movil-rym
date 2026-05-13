import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Card} from 'react-native-paper';
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
  const _comprobarBoleto = (data, capturedImageUri, resetInputField) => {
    pagoHook.comprobarBoleto(data, capturedImageUri, resetInputField);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.modernCard}>
        <Card.Content>
          <Text style={styles.instructionText}>Escanea o ingresa el código QR</Text>
          {/* BOLETO INPUT GROUP AND SCANNER */}
          <CustomTicketInputGroup
            onSubmit={_comprobarBoleto}
            disableSubmit={cargandoPagos}
          />
          <View style={styles.alertContainer}>
            <CustomAlert
              text="Conserve el ticket una vez realizado el pago ya que podría solicitarse para su recolección."
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
        onCancel={pagoHook.handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'pagar' && modal.config.content}
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
