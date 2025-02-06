import React from 'react';
import {Text, View, TextInput, StyleSheet, Alert} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {registrarMagico} from '../../../../services/tickets';
import {setMonto} from '../../../../features/tickets/magico/magicoSlice';
import {restarCredito} from '../../../../features/credito/creditoSlice';
import {agregarRegistroAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {Print, Utils} from '../../../../utils';
import {
  useAlert,
  useBluetooth,
  useCustomNavigation,
  useLogout,
  useModal,
  usePrinter,
  useThermalPrinter,
} from '../../../../hooks';
import {APP_NAVIGATION} from '../../../../constants';
import {CustomModal} from '../../../../components';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../errors';
import {verifyUserAccountStatus} from '../../../../services/reports';
import {useNetInfo} from '@react-native-community/netinfo';

export default function Registrar() {
  return (
    <View style={styles.footer}>
      <Monto />
      <Total />
      <RegistrarButton />
    </View>
  );
}

function Monto() {
  const {monto} = useSelector(state => state.magico);
  const dispatch = useDispatch();

  const handleChange = text => {
    if (
      text.indexOf(',') === -1 &&
      text.indexOf('.') === -1 &&
      text.indexOf('-') === -1 &&
      text.trim().length < 4
    ) {
      const _monto = text == '' ? 0 : parseInt(text.trim());
      dispatch(setMonto(_monto.toString()));
    }
  };

  return (
    <View style={styles.montoBox}>
      <Text style={[styles.footerText, {marginRight: 10}]}>Monto</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.montoInput}
        value={monto}
        onChangeText={handleChange}
      />
    </View>
  );
}

function Total() {
  const {numeroJugadas, numeroLugares, monto} = useSelector(
    state => state.magico,
  );
  const _total =
    parseInt(monto) * parseInt(numeroJugadas) * parseInt(numeroLugares.length);
  return (
    <View style={styles.totalBox}>
      <Text style={styles.footerText}>
        Total: ${isNaN(_total) ? 0 : _total} pts
      </Text>
    </View>
  );
}

function RegistrarButton() {
  const {sorteoSeleccionado, numeroJugadas, cifras, numeroLugares, monto} =
    useSelector(state => state.magico);
  const {creditoDisponible} = useSelector(state => state.credito);
  const modal = useModal();
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();
  const thermalPrinter = useThermalPrinter();
  const {logout} = useLogout();
  const netInfo = useNetInfo();
  const disableButton =
    !sorteoSeleccionado ||
    numeroJugadas.length === 0 ||
    cifras === '' ||
    numeroLugares.length === 0 ||
    monto === '' ||
    monto == 0;

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
  const handlePress = () => {
    if (
      sorteoSeleccionado &&
      numeroLugares.length <= sorteoSeleccionado.numLugares &&
      numeroJugadas !== '' &&
      cifras !== '' &&
      monto !== ''
    ) {
      handleGuardar();
    }
  };
  // HANDLE REGISTER MAGIC
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
        const boletoRegistrado = await registrarMagico({
          sorteo: sorteoSeleccionado,
          numeroJugadas,
          cifras,
          numeroLugares,
          monto,
          creditoDisponible,
        });
        // IMPRIMIR TICKET MAGICO
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
        await thermalPrinter.print(async function () {
          await Print.ticket(boletoRegistrado, true);
        });
        modal.setConfig({open: false});
        navigation.goBack();
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

  return (
    <>
      <View
        style={{
          backgroundColor: disableButton ? 'gray' : '#03C988',
          marginLeft: 5,
          borderRadius: 50,
        }}>
        <IconButton
          disabled={disableButton}
          icon="printer"
          iconColor="#fff"
          onPress={handlePress}
        />
      </View>
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

const styles = StyleSheet.create({
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  footerText: {
    fontSize: 20,
    color: '#fff',
  },
  montoBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  montoInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 50,
  },
  totalBox: {
    height: 50,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
