import React from 'react';
import {StyleSheet, Text, View, Linking, Alert} from 'react-native';
import {IconButton, TextInput} from 'react-native-paper';
import {Colors, Storage, Utils} from '../../../../../utils';
import {CustomModal} from '../../../../../components';
import {useCustomNavigation, useLogout, useModal} from '../../../../../hooks';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {registrarMagicoApi, registrarTicketApi} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import {ERROR_CODE_NAMES} from '../../../../../errors';
import {
  restarCredito,
  setMostrarCredito,
} from '../../../../../features/credito/creditoSlice';
import {agregarRegistroAlMomento} from '../../../../../features/tickets/cliente/clienteSlice';
import {setJugadas} from '../../../../../features/tickets/jugarTickets/jugarTicketsSlice';

export default function WhatsappBtn() {
  const {jugadas, sorteoSeleccionado} = useSelector(
    state => state.jugarTickets,
  );
  const modal = useModal();
  const {logout} = useLogout();
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();

  const formik = useFormik({
    initialValues: {
      numero: '',
    },
    validationSchema: Yup.object().shape({
      numero: Yup.string()
        .required('Este campo es requerido')
        .min(10, 'Ingresa un número a 10 digitos')
        .matches('[0-9]', 'Debes ingresar solo números'),
    }),
  });

  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };

  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'ingresar-tel') {
      sendMessage();
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
    sendMessage(jugadasActualizadas);
  };

  const handleCompartir = async () => {
    const canOpenUrl = await Linking.canOpenURL(`whatsapp://send?text=&phone=`);
    if (!canOpenUrl) {
      modal.setConfig({
        open: true,
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: (
          <Text style={styles.errorAlertText}>
            Parece que no tienes Whatsapp instalado, por favor instalalo y
            vuelve a intentar.
          </Text>
        ),
      });
      return;
    }
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: 'Enviar a:',
      action: 'ingresar-tel',
      contentType: 'ingresar-tel',
      confirmBtnText: 'Aceptar',
      showCancelBtn: true,
    });
  };

  const handleChange = text => {
    formik.setFieldValue('numero', text.replace(/[^0-9]/g, ''));
  };

  const sendMessage = async newJugadas => {
    try {
      Storage.removeItem('saturados');
      const _jugadas = newJugadas ?? [...jugadas];
      const numeroValido = formik.values.numero.length === 10;
      const sorteoValido = !!sorteoSeleccionado;
      const hayJugadas = _jugadas.length > 0;

      if (!numeroValido || !sorteoValido || !hayJugadas) return;

      modal.setConfig({
        type: 'progress',
        progressTitle: 'Registrando ticket',
      });

      const primeraJugada = _jugadas[0];
      const esMagico = primeraJugada.numero.includes('X');
      let boletoRegistrado = null;

      if (esMagico) {
        boletoRegistrado = await registrarTicketMagico(_jugadas);
      } else {
        boletoRegistrado = await registrarTicketNormal(_jugadas);
      }

      await enviarPorWhatsapp(boletoRegistrado);
    } catch ({message}) {
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message === ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message === ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }

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
        error: <Text style={styles.errorAlertText}>{message}</Text>,
      });
    }
  };

  const registrarTicketMagico = async newJugadas => {
    const numeroJugadas = newJugadas.length;
    const cifras = newJugadas[0].numero.length;
    const lugares = newJugadas[0].lugares;

    return await registrarMagicoApi(
      sorteoSeleccionado.id,
      numeroJugadas,
      lugares,
      cifras,
      'whatsapp',
      formik.values.numero,
    );
  };

  const registrarTicketNormal = async newJugadas => {
    return await registrarTicketApi(
      sorteoSeleccionado.id,
      newJugadas,
      'whatsapp',
      formik.values.numero,
    );
  };

  const enviarPorWhatsapp = async boletoRegistrado => {
    const link = `https://api-rym.mecaorg.com/tickets/${boletoRegistrado.id}\n\n`;
    const numero = `+52${formik.values.numero}`;
    const url = `whatsapp://send?text=${link}&phone=${numero}`;

    const puedeAbrir = await Linking.canOpenURL(url);

    if (!puedeAbrir) {
      Alert.alert(
        'Mensaje',
        `Parece que no tienes Whatsapp instalado, por favor instálalo y anota el número de boleto ${boletoRegistrado.numeroBoleto}`,
      );
      return;
    }

    await Linking.openURL(url);

    const totalVenta = Utils.totalWithoutCommissionTicket(
      boletoRegistrado.totalApostado,
    );

    dispatch(setMostrarCredito(true));
    dispatch(restarCredito(totalVenta));
    dispatch(
      agregarRegistroAlMomento({
        id: boletoRegistrado.id,
        fecha: boletoRegistrado.fechaExp,
        numeroBoleto: boletoRegistrado.numeroBoleto,
        hora: boletoRegistrado.horaImpresion,
        total: boletoRegistrado.totalApostado,
        tipo: 'boleto',
        via: boletoRegistrado.via,
      }),
    );

    setTimeout(() => {
      dispatch(setMostrarCredito(false));
    }, 5000);

    modal.setConfig({open: false});
    navigation.goBack();
  };

  const isButtonDisabled = modal.config.action === 'ingresar-tel' && formik.values.numero.length !== 10;

  return (
    <>
      <IconButton
        disabled={jugadas.length <= 0}
        icon="whatsapp"
        iconColor={Colors.green}
        size={40}
        onPress={handleCompartir}
        style={styles.iconButton}
      />
      <CustomModal
        open={modal.config.open}
        type={modal.config.type}
        progressTitle={modal.config.progressTitle}
        alertTitle={modal.config.alertTitle}
        showCancelButton={modal.config.showCancelBtn}
        cancelButtonText={modal.config.cancelBtnText}
        confirmButtonText={modal.config.confirmBtnText}
        confirmButtonDisabled={isButtonDisabled}
        showConfirmBtn={modal.config.showConfirmBtn}
        onCancel={handleModalCancel}
        onAccept={handleModalAccept}
        showCloseBtn={true}
        onClose={handleModalCancel}
      >
        {modal.config.contentType === 'ingresar-tel' && (
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              label="Número de teléfono"
              keyboardType="numeric"
              placeholder="10 dígitos"
              maxLength={10}
              onChangeText={handleChange}
              value={formik.values.numero}
              autoFocus={true}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              activeOutlineColor="#0E1321"
              outlineColor="#E2E8F0"
              left={<TextInput.Affix text="+52 " />}
              error={formik.errors.numero && formik.values.numero.length > 0}
            />
            {formik.errors.numero && formik.values.numero.length > 0 && (
              <Text style={styles.errorText}>{formik.errors.numero}</Text>
            )}
          </View>
        )}
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && (
          <View style={styles.errorContent}>
            {modal.config.error}
          </View>
        )}
        {modal.config.action === 'numeros-saturados' && (
          <Text style={styles.warningText}>
            Si continuas las jugadas ajustaran sus cantidades automaticamente y
            las que esten completamente agotadas serán eliminadas.
          </Text>
        )}
      </CustomModal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    margin: 0,
  },
  inputContainer: {
    paddingVertical: 10,
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
  },
  inputOutline: {
    borderRadius: 12,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 5,
  },
  errorAlertText: {
    fontFamily: 'Inter',
    fontSize: 15,
    textAlign: 'center',
    color: '#1E293B',
    lineHeight: 22,
  },
  warningText: {
    fontFamily: 'Inter',
    fontSize: 15,
    textAlign: 'center',
    color: '#1E293B',
    lineHeight: 22,
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 10,
  }
});
