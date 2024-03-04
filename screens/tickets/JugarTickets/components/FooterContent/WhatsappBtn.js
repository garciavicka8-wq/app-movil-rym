import React from 'react';
import {IconButton, TextInput} from 'react-native-paper';
import {Colors, Helpers, Utils} from '../../../../../utils';
import {CustomModal} from '../../../../../components';
import {useCustomNavigation, useLogout, useModal} from '../../../../../hooks';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {Linking} from 'react-native';
import {registrarTicket} from '../../../../../services/tickets';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from 'react-native';
import {ERROR_CODE_NAMES} from '../../../../../errors';
import {
  restarCredito,
  setMostrarCredito,
} from '../../../../../features/credito/creditoSlice';
import {agregarRegistroAlMomento} from '../../../../../features/tickets/cliente/clienteSlice';
import {useNetInfo} from '@react-native-community/netinfo';
const qs = require('qs');

export default function WhatsappBtn() {
  const {jugadas, sorteoSeleccionado} = useSelector(
    state => state.jugarTickets,
  );
  const {creditoDisponible} = useSelector(state => state.credito);
  const modal = useModal();
  const {logout} = useLogout();
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();
  const netInfo = useNetInfo();
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

  const enviarInformacionBoleto = async () => {
    try {
      const url = 'https://graph.facebook.com/v17.0/152796834592379/messages';
      const token =
        'EAAL6U6f2f0IBO0KNKypmpihe3ZAqbDSS4Q2SP7l6sBeggDgUZC8SvWVUXptmn5aL3Bmp1igrAgS02skFQTRGRnvGa5XnlluKLgROh8X8F5Is7bzuXZCZBcZANSFUzOxDYscPE4cbzHFZAL8G1FSjUVSInypbROeZCTowo9OCvmjEbc3pAOZBXxDzgCxEQ1LEJvL9';
      // const data = qs.stringify();
      axios
        .post(
          url,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: '524772526180',
            type: 'text',
            text: {
              preview_url: false,
              body: 'Hola desde RYM, este es un msg de produccion. ',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )
        .then(response => {
          console.log(response.data);
        })
        .catch(console.log);
    } catch ({message}) {
      console.log(message);
    }
  };

  const sendMessage = async () => {
    try {
      if (
        formik.values.numero.length === 10 &&
        sorteoSeleccionado &&
        jugadas.length > 0
      ) {
        modal.setConfig({
          type: 'progress',
          progressTitle: 'Registrando ticket',
        });
        const boletoRegistrado = await registrarTicket(
          sorteoSeleccionado,
          jugadas,
          creditoDisponible,
          true, // VIAWHASAPP
          formik.values.numero, // NUMERO AL QUE SE ENVIARA EL ENLACE
        );
        // console.log('Ticket ID: ', boletoRegistrado.id);
        let text = `https://tickets.recargasymas.com.mx/${boletoRegistrado.id}\n\n`;
        const phoneNumber = `+52${formik.values.numero}`;
        const canOpenUrl = await Linking.canOpenURL(
          `whatsapp://send?text=${text}&phone=${phoneNumber}`,
        );
        if (canOpenUrl) {
          // RESET LOGIN TIME
          // await Utils.setLoginTime();
          Linking.openURL(
            `whatsapp://send?text=${text}&phone=${phoneNumber}`,
          ).then(response => {
            // RESTAMOS LA VENTA DEL BOLETO AL CREDITO DISPONIBLE
            const totalVentaBoleto = Utils.totalWithoutCommissionTicket(
              boletoRegistrado.totalApostado,
            );
            dispatch(setMostrarCredito(true));
            dispatch(restarCredito(totalVentaBoleto));
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
          });
        } else {
          alert(
            'Parece que no tienes Whatsapp instalado, por favor instalalo y vuelve a intentar.',
          );
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
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: <Text>{message}</Text>,
      });
    }
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
      </CustomModal>
    </>
  );
}
