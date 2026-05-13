import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
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
import {Helpers, Print, Storage, Colors} from '../../../../utils';
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
        const comision =
          isRecarga && _comisionRecargas !== undefined
            ? _comisionRecargas
            : Helpers.sumWithDecimals(Cargo, Comision) || Money(2);

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

        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: rymResponse.success ? 'mensaje' : 'error',
          action: rymResponse.success ? 'mensaje' : 'error',
          showCancelBtn: false,
          content: (
            <Text style={styles.modalText}>
              {rymResponse.success
                ? `Comprobante enviado a ${data.correo}`
                : 'Error al enviar el comprobante'}
            </Text>
          ),
          confirmBtnText: 'Entendido',
        });

        formik.handleReset();
      } catch (error) {
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          content: <Text style={styles.modalText}>{error.message}</Text>,
          confirmBtnText: 'Entendido',
        });
        formik.handleReset();
      }
    },
  });

  const navigation = useCustomNavigation();
  
  const handleModalCancel = () => {
    modal.setConfig({open: false});
    formik.handleReset();
  };

  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'enviar') {
      formik.handleSubmit();
    }
  };

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
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Error de Impresión',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
        content: <Text style={styles.modalText}>Verifica que la impresora esté encendida y conectada.</Text>,
      });
    }
  };

  const terminar = async () => {
    modal.setConfig({open: false});
    navigation.resetStack(APP_NAVIGATION.SCREENS.RECARGAS_MENU);
  };

  if (transaccionStore.Status !== 'Exitosa') {
    return (
      <View style={styles.actions}>
        <Button 
          mode="contained" 
          buttonColor={Colors.primary} 
          style={styles.fullButton}
          onPress={() => navigation.goBack()}
        >
          REGRESAR
        </Button>
      </View>
    );
  }

  return (
    <>
      <View style={styles.actions}>
        <Text style={styles.subtitle}>Acciones</Text>
        
        <View style={styles.buttonGrid}>
          <View style={styles.buttonWrapper}>
            {shareWhatsappBtn}
          </View>
          <View style={styles.buttonWrapper}>
            <Button 
              mode="contained" 
              buttonColor="#3B82F6" 
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              onPress={() => enviarCorreo()}
            >
              CORREO
            </Button>
          </View>
        </View>

        <View style={[styles.buttonGrid, {marginTop: 12}]}>
          <View style={styles.buttonWrapper}>
            <Button 
              mode="contained" 
              buttonColor="#64748B" 
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              onPress={() => imprimir()}
            >
              IMPRIMIR
            </Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button 
              mode="contained" 
              buttonColor="#0E1321" 
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              onPress={() => terminar()}
            >
              TERMINAR
            </Button>
          </View>
        </View>
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
            label="Correo Electrónico"
            keyboardType="email-address"
            value={formik.values.correo}
            onChange={formik.handleChange('correo')}
            onBlur={formik.handleBlur('correo')}
            error={formik.errors.correo && formik.touched.correo}
            errorMessage={formik.errors.correo}
          />
        )}
        {(modal.config.contentType === 'mensaje' || modal.config.contentType === 'error') && modal.config.content}
      </CustomModal>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    width: '48%',
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  fullButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  }
});
