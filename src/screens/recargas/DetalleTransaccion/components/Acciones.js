import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {Button} from 'react-native-paper';
import {
  useCustomNavigation,
  useModal,
  useThermalPrinter,
} from '../../../../hooks';
import {CustomInput, CustomModal} from '../../../../components';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {sendTransactionReceipt} from '../../../../services/taecel';
import {useSelector} from 'react-redux';
import {Helpers, Print, Storage} from '../../../../utils';
import {APP_NAVIGATION, TXN} from '../../../../constants';
import {ERROR_NAMES} from '../../../../errors';

export default function Acciones({shareWhatsappBtn = null}) {
  const {transaccionStore} = useSelector(state => state.taecel);
  const modal = useModal();
  const thermalPrinter = useThermalPrinter();
  const formik = useFormik({
    initialValues: {
      correo: '',
    },
    validationSchema: Yup.object().shape({
      correo: Yup.string()
        .required('Este campo es obligatorio')
        .email('Introduce un correo valido'),
    }),
    onSubmit: async data => {
      try {
        // Mostrar modal de progreso
        modal.setConfig({
          open: true,
          type: 'progress',
          progressTitle: 'Enviando',
        });

        const usuario = Storage.getUser();
        const {
          CategoriaID,
          Cargo,
          Comision,
          _comisionRecargas,
          Monto,
          Telefono,
          Carrier,
          Bolsa,
          Folio,
          TransID,
          Status,
          Fecha,
        } = transaccionStore;
        const isRecarga = [TXN.CODES.RECARGA, TXN.CODES.PAQUETE].includes(
          CategoriaID,
        );
        // Determinar comisión
        const comision =
          isRecarga && _comisionRecargas !== undefined
            ? _comisionRecargas
            : Helpers.sumWithDecimals(Cargo, Comision) || Money(2);
        // Enviar comprobante
        const rymResponse = await sendTransactionReceipt({
          correo: data.correo,
          status: Status,
          monto: Monto,
          referencia: Telefono,
          carrier: Carrier,
          bolsa: Bolsa,
          folio: Folio,
          transID: TransID,
          tienda: usuario?.nomComercial || 'Tienda',
          comision,
          total: Helpers.sumArrayWithDecimals([Monto, Cargo, comision]),
          fecha: Fecha,
        });

        // Manejo de respuesta
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: rymResponse.success ? 'mensaje' : 'error',
          action: rymResponse.success ? 'mensaje' : 'error',
          showCancelBtn: false,
          content: (
            <Text>
              {rymResponse.success
                ? `Comprobante enviado a ${data.correo}`
                : 'Error al enviar el comprobante'}
            </Text>
          ),
          confirmBtnText: 'Entendido',
        });

        formik.handleReset();
      } catch (error) {
        console.error('[onSubmit] Error:', error.message);
        console.log(error);

        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          content: <Text>{error.message}</Text>,
          confirmBtnText: 'Entendido',
        });

        formik.handleReset();
      }
    },
  });
  const navigation = useCustomNavigation();
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
    formik.handleReset();
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'enviar') {
      formik.handleSubmit();
    }
  };
  // ENVIAR COMPROBANTE
  const enviarCorreo = () => {
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: 'Enviar comprobante',
      contentType: 'enviar',
      confirmBtnText: 'Enviar',
      action: 'enviar',
      showCancelBtn: true,
    });
  };
  //   IMPRIMIR COMPROBANTE
  const imprimir = async () => {
    try {
      if (!thermalPrinter.isPrinting) {
        modal.setConfig({
          open: true,
          type: 'progress',
          progressTitle: 'Imprimiendo',
        });
        const isPrintingPossible = await thermalPrinter.isPrintingPossible();
        if (isPrintingPossible) {
          // IMPRIMIR COMPROBANTE
          await thermalPrinter.print(async function () {
            await Print.transactionReceipt(transaccionStore);
          });
          modal.setConfig({open: false});
        }
      }
    } catch ({message}) {
      if (message === 'PRINTING_NOT_POSSIBLE') {
        modal.setConfig({open: false});
        return;
      }
      if (message === ERROR_NAMES.CONNECTING_DEVICE_FAILED) {
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          confirmBtnText: 'Entendido',
          error: <Text>verifica que la impresora este encendida</Text>,
        });
        return;
      }
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
        error: <Text>{message}</Text>,
      });
      modal.setConfig({open: false});
    }
  };

  const terminar = async () => {
    // Utils.setLoginTime();
    modal.setConfig({open: false});
    navigation.resetStack(APP_NAVIGATION.SCREENS.RECARGAS_MENU);
  };

  if (transaccionStore.Status !== 'Exitosa') {
    return null;
  }

  return (
    <>
      <View style={styles.actions}>
        <Text style={styles.subtitulo}>Compartir</Text>
        <Row style={{marginBottom: 10}}>
          {shareWhatsappBtn && <Col style={styles.col}>{shareWhatsappBtn}</Col>}
          <ColButton color="red" text="CORREO" onPress={() => enviarCorreo()} />
        </Row>
        <Row>
          <ColButton color="black" text="IMPRIMIR" onPress={() => imprimir()} />
          <ColButton color="gray" text="TERMINAR" onPress={() => terminar()} />
        </Row>
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
        {modal.config.contentType === 'enviar' && (
          <CustomInput
            label="Correo"
            keyboardType="email-address"
            value={formik.values.correo}
            onChange={formik.handleChange('correo')}
            onBlur={formik.handleBlur('correo')}
            error={formik.errors.correo && formik.touched.correo}
            errorMessage={formik.errors.correo}
          />
        )}
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.content}
      </CustomModal>
    </>
  );
}

const ColButton = ({onPress, text, color}) => {
  return (
    <Col style={styles.col}>
      <Button mode="contained" buttonColor={color} onPress={onPress}>
        {text}
      </Button>
    </Col>
  );
};

const styles = StyleSheet.create({
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    marginVertical: 20,
  },
  col: {
    paddingHorizontal: 2,
  },
});
