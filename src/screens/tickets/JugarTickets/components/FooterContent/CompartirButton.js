import React, {useState} from 'react';
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
import {
  registrarMagico,
  registrarTicket,
} from '../../../../../services/tickets';
import {Colors, Print, Storage, Utils} from '../../../../../utils';
import {agregarRegistroAlMomento} from '../../../../../features/tickets/cliente/clienteSlice';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';
import {TICKET_TYPE} from '../../../../../constants';
import {setJugadas} from '../../../../../features/tickets/jugarTickets/jugarTicketsSlice';

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
  const [registrando, setRegistrando] = useState(false);
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'numeros-saturados') {
      handleNumerosSaturados();
    }
  };

  const handleNumerosSaturados = () => {
    const jugadasActualizadas =
      Utils.actualizarJugadasNumerosSaturados(jugadas);
    dispatch(setJugadas(jugadasActualizadas));
    if (jugadasActualizadas.length === 0) {
      modal.setConfig({open: false});
      return;
    }
    handleGuardarBoleto(jugadasActualizadas);
  };
  //   HANDLE GUARDAR BOLETO
  const handleGuardarBoleto = async newJugadas => {
    const _jugadas = newJugadas ?? [...jugadas];
    // LIMPIAR SATURADOS DE MEMORIA EN CASO DE EXISTIR
    Storage.removeItem('saturados');

    if (sorteoSeleccionado && _jugadas.length > 0) {
      const esAutomatico = _jugadas.some(item => item.numero.includes('X'));
      if (esAutomatico) {
        handleRegistrarAutomatico(_jugadas);
      } else {
        handleGuardar(_jugadas);
      }
    }
  };
  // GUARDAR JUGADA E IMPRIMIR TICKET
  const handleGuardar = async newJugadas => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Registrando boleto',
      });

      // Verificar conexión
      if (!netInfo?.isConnected) {
        modal.setConfig({open: false});
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }

      // Verificar si la impresión es posible
      if (await thermalPrinter.isPrintingPossible()) {
        const boletoRegistrado = await registrarTicket(
          sorteoSeleccionado,
          newJugadas,
          creditoDisponible,
        );

        // Si el boleto se registró correctamente
        if (boletoRegistrado) {
          handleBoletoRegistrado(boletoRegistrado);
        }
      }
    } catch ({message}) {
      handleErrorsRegistrar(message);
    }
  };

  // REGISTRAR TICKET AUTOMATICO
  const handleRegistrarAutomatico = async () => {
    if (registrando) return;

    setRegistrando(true);

    modal.setConfig({
      open: true,
      type: 'progress',
      progressTitle: 'Registrando boleto',
    });

    // Verificar conexión
    if (!netInfo?.isConnected) {
      modal.setConfig({open: false});
      Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
      return;
    }

    try {
      const cifras = jugadas[0].numero.length;
      const numeroJugadas = jugadas.length;
      let numeroLugares = [];
      let monto = '0';

      jugadas[0].lugares.forEach((item, index) => {
        if (item > 0) {
          numeroLugares.push(index + 1 + '');
          monto = item;
        }
      });

      // Verificar si la impresión es posible
      if (await thermalPrinter.isPrintingPossible()) {
        const boletoAutomaticoRegistrado = await registrarMagico({
          sorteo: sorteoSeleccionado,
          numeroJugadas,
          cifras,
          numeroLugares,
          monto,
          creditoDisponible,
        });

        if (boletoAutomaticoRegistrado) {
          handleBoletoRegistrado(boletoAutomaticoRegistrado);
        }
      }
    } catch ({message}) {
      handleErrorsRegistrar(message);
    } finally {
      setRegistrando(false);
    }
  };
  // HANDLE BOLETO REGISTRADO
  const handleBoletoRegistrado = async boletoRegistrado => {
    modal.setConfig({progressTitle: 'Imprimiendo'});
    try {
      // Restar la venta del boleto al crédito disponible
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

      // Imprimir el boleto
      await thermalPrinter.print(() =>
        Print.ticket(
          boletoRegistrado,
          boletoRegistrado.tipo === TICKET_TYPE.MAGICO,
        ),
      );
      modal.setConfig({open: false});
      navigation.goBack();
    } catch (e) {
      throw new Error(e);
    }
  };
  // HANDLE ERRORS AL REGISTRAR
  const handleErrorsRegistrar = message => {
    const errorActions = {
      DEVICE_NOT_LINKED: logout,
      [ERROR_CODE_NAMES.OUTDATED_APP_VERSION]: logout,
      [ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT]: logout,
      PRINTING_NOT_POSSIBLE: () => modal.setConfig({open: false}),
    };

    if (errorActions[message]) {
      errorActions[message]();
      return;
    }

    const errorContent =
      message === ERROR_NAMES.CONNECTING_DEVICE_FAILED
        ? 'verifica que la impresora esté encendida'
        : message;

    const saturados = Storage.getItem('saturados', true);
    const alertTitle = saturados ? 'Números saturados' : 'Mensaje';

    modal.setConfig({
      type: 'alert',
      alertTitle: alertTitle,
      contentType: 'error',
      action: saturados ? 'numeros-saturados' : 'error',
      showCancelBtn: saturados !== null,
      cancelBtnText: saturados !== null ? 'Cerrar' : 'Cancelar',
      confirmBtnText: saturados !== null ? 'Continuar' : 'Aceptar',
      error: <Text>{errorContent}</Text>,
    });
  };

  const disabledButton = jugadas.length <= 0;

  return (
    <>
      <IconButton
        disabled={disabledButton}
        icon="printer"
        iconColor={Colors.dark}
        size={30}
        onPress={() => handleGuardarBoleto()}
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
        {modal.config.action === 'numeros-saturados' && (
          <Text>
            Si continuas las jugadas ajustaran sus cantidades automaticamente y
            las que esten completamente agotadas serán eliminadas.
          </Text>
        )}
      </CustomModal>
    </>
  );
}
