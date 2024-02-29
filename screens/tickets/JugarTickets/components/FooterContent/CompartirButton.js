import React from 'react';
import {Alert, Text} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal} from '../../../../../components';
import {restarCredito} from '../../../../../features/credito/creditoSlice';
import {
  useCustomNavigation,
  useModal,
  useLogout,
  useThermalPrinter,
} from '../../../../../hooks';
import {registrarTicket} from '../../../../../services/tickets';
import {Colors, Print, Utils} from '../../../../../utils';
import {agregarRegistroAlMomento} from '../../../../../features/tickets/cliente/clienteSlice';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';

export default function CompartirButton() {
  const {jugadas, sorteoSeleccionado} = useSelector(
    state => state.jugarTickets,
  );
  const {creditoDisponible} = useSelector(state => state.credito);
  const modal = useModal();
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();
  const thermalPrinter = useThermalPrinter();
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
  //   HANDLE GUARDAR BOLETO
  const handleGuardarBoleto = () => {
    if (sorteoSeleccionado && jugadas.length > 0) {
      handleGuardar();
    }
  };
  // GUARDAR JUGADA E IMPRIMIR TICKET
  const handleGuardar = async () => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Registrando boleto',
      });
      // VERIFICAR CONEXION
      if (!netInfo?.isConnected) {
        modal.setConfig({
          open: false,
        });
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      // CHECK IF BLUETOOTH IS ENABLED AND PRINTER IS REGISTERED AND CONNECTED
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible) {
        const boletoRegistrado = await registrarTicket(
          sorteoSeleccionado,
          jugadas,
          creditoDisponible,
        );
        // SI EL BOLETO SE REGISTRO
        if (boletoRegistrado) {
          modal.setConfig({
            progressTitle: 'Imprimiendo',
          });
          // RESTAMOS LA VENTA DEL BOLETO AL CREDITO DISPONIBLE
          const totalVentaBoleto = Utils.totalWithoutCommissionTicket(
            boletoRegistrado.totalApostado,
          );
          dispatch(restarCredito(totalVentaBoleto));
          dispatch(
            agregarRegistroAlMomento({
              id: boletoRegistrado.id,
              fecha: boletoRegistrado.fechaExp,
              numeroBoleto: boletoRegistrado.numeroBoleto,
              hora: boletoRegistrado.horaImpresion,
              total: boletoRegistrado.totalApostado,
              tipo: 'boleto',
            }),
          );
          await thermalPrinter.print(Print.ticket(boletoRegistrado));
          modal.setConfig({open: false});
          navigation.goBack();
        }
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
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: (
          <Text>
            {message === ERROR_NAMES.CONNECTING_DEVICE_FAILED
              ? 'verifica que la impresora este encendida'
              : message}
          </Text>
        ),
      });
    }
  };

  const disabledButton = jugadas.length <= 0;

  return (
    <>
      <IconButton
        disabled={disabledButton}
        icon="printer"
        iconColor={Colors.dark}
        size={30}
        onPress={handleGuardarBoleto}
      />
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
