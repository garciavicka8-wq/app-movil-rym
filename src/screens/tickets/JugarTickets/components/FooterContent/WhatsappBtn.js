import React from 'react';
import {IconButton, TextInput} from 'react-native-paper';
import {Colors, Storage, Utils} from '../../../../../utils';
import {CustomModal} from '../../../../../components';
import {useCustomNavigation, useLogout, useModal} from '../../../../../hooks';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Alert, Linking} from 'react-native';
import {registrarMagicoApi, registrarTicketApi} from '../../services';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from 'react-native';
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
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'ingresar-tel') {
      // enviarInformacionBoleto();
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
          <Text>
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
      console.log('105 -> sendMessage');
      // LIMPIAR SATURADOS DE MEMORIA EN CASO DE EXISTIR
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
        // console.log('es magico');
        boletoRegistrado = await registrarTicketMagico(_jugadas);
      } else {
        console.log('es normal');
        boletoRegistrado = await registrarTicketNormal(_jugadas);
      }
      console.log('130 -> boletoRegistrado', boletoRegistrado);

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
        error: <Text>{message}</Text>,
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
    const link = `https://tickets.recargasymas.com.mx/${boletoRegistrado.id}\n\n`;
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

  return (
    <>
      <IconButton
        disabled={jugadas.length <= 0}
        icon="whatsapp"
        iconColor={Colors.green}
        size={40}
        onPress={handleCompartir}
        style={{margin: 0}}
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
        {modal.config.contentType === 'ingresar-tel' && (
          <TextInput
            keyboardType="numeric"
            placeholder="Número a 10 digitos"
            maxLength={10}
            onChangeText={handleChange}
            error={formik.errors.numero}
            value={formik.values.numero}
            autoFocus={true}
          />
        )}
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
