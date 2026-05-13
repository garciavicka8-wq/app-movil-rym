import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import {Alert, Text, View, StyleSheet} from 'react-native';
import {useFormik} from 'formik';
import {useCustomNavigation, useLogout, useModal} from '../../../hooks';
import * as Yup from 'yup';
import {Colors, Storage} from '../../../utils';
import {CustomModal} from '../../../components';
import {Container, Content} from '../../../components/Layout';
import {Button, Card, Appbar} from 'react-native-paper';
import {usuarioAutenticado} from '../../../services/auth';
import {APP_NAVIGATION} from '../../../constants';
import CustomNumericField from '../../../components/CustomNumericField';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import { saveUserAppPINCodeAPi } from './services';
import CustomStatusBar from '../../../components/CustomStatusBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CodigoPin({navigation}) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [verificandoCodigoPin, setVerificandoCodigoPin] = useState(true);
  const [cardContent, setCardContent] = useState({
    text: '',
    buttonText: '',
  });
  const modal = useModal();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const formik = useFormik({
    initialValues: {
      password: '',
      codigoPin: '',
      confirmarCodigoPin: '',
    },
    validationSchema: Yup.object().shape({
      password: Yup.string().required('Este campo es requerido'),
      codigoPin: Yup.string()
        .required('Este campo es requerido')
        .matches(/^[0-9]+$/, 'Debe ser númerico')
        .min(4, 'El pin debe de 4 digitos')
        .max(4, 'El pin debe de 4 digitos'),
      confirmarCodigoPin: Yup.string()
        .matches(/^[0-9]+$/, 'Debe ser númerico')
        .required('Este campo es requerido')
        .oneOf([Yup.ref('codigoPin')], 'El Pin no coincide')
        .min(4, 'El pin debe ser de 4 digitos')
        .max(4, 'El pin debe ser de 4 digitos'),
    }),
    onSubmit: data => {
      savePINCode(data);
    },
  });

  useEffect(() => {
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      comprobarCodigoPin();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  const comprobarCodigoPin = async () => {
    try {
      setVerificandoCodigoPin(true);
      const existePin = Storage.getItem('codigoPin');
      if (existePin) {
        setCardContent({
          text: 'Parece que ya tienes un PIN definido. ¿Quieres cambiarlo para mayor seguridad?',
          buttonText: 'Cambiar código PIN',
          action: 'actualizar',
        });
      } else {
        setCardContent({
          text: 'El código PIN protege tus transacciones. Solo quien conozca el PIN podrá realizar operaciones financieras en esta app.',
          buttonText: 'Crear código PIN',
          action: 'crear',
        });
      }
      setVerificandoCodigoPin(false);
    } catch ({message}) {
      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      Alert.alert(message);
    }
  };

  const handleModalCancel = () => {
    modal.setConfig({open: false});
    formik.handleReset();
  };

  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (
      modal.config.action === 'actualizar' ||
      modal.config.action === 'crear'
    ) {
      formik.handleSubmit();
    }
    if (modal.config.action === 'autenticado') {
      modal.setConfig({open: false});
      navigation.replace(APP_NAVIGATION.SCREENS.CONFIG_MENU);
    }
  };

  const handleOpenModal = () => {
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: cardContent.action == 'actualizar' ? 'Actualizar PIN' : 'Configurar PIN',
      action: cardContent.action,
      contentType: cardContent.action,
      showCancelBtn: true,
      confirmBtnText: 'Confirmar',
    });
  };

  const savePINCode = async ({password, codigoPin}) =>{
      if (!netInfo?.isConnected) {
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Guardando PIN...',
      });
      
      try {
        const data = await saveUserAppPINCodeAPi(password, codigoPin);
        Storage.setItem('codigoPin', data.codigoPin);
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Éxito',
          contentType: 'mensaje',
          action: 'autenticado',
          showCancelBtn: false,
          content: <Text style={styles.modalText}>Código PIN guardado correctamente.</Text>,
          confirmBtnText: 'Entendido',
        });
      } catch (error) {
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Error',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          error: <Text style={styles.modalText}>{error.message}</Text>,
          confirmBtnText: 'Reintentar',
        });
      }
  }

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Código PIN" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content>
          {verificandoCodigoPin ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Verificando configuración...</Text>
            </View>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.iconCircle}>
                  <Icon name="lock-reset" size={40} color="#0E1321" />
                </View>
                <Text style={styles.cardText}>
                  {cardContent.text}
                </Text>
              </Card.Content>
              <View style={styles.cardActions}>
                <Button
                  uppercase
                  mode="contained"
                  buttonColor="#0E1321"
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                  onPress={handleOpenModal}>
                  {cardContent.buttonText}
                </Button>
              </View>
            </Card>
          )}
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
            {(modal.config.contentType === 'actualizar' ||
              modal.config.contentType === 'crear') && (
              <ModalFormContent formik={formik} />
            )}
            {modal.config.contentType === 'mensaje' && modal.config.content}
            {modal.config.contentType === 'error' && modal.config.error}
          </CustomModal>
        </Content>
        <NoConnectionSnackbar
          open={openSnackbar}
          onDismiss={() => setOpenSnackbar(false)}
        />
      </Container>
    </View>
  );
}

const ModalFormContent = ({formik}) => {
  const codigoPinRef = useRef(null);
  const confirmarCodigoPinRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    codigoPinRef.current?.focus();
  }, []);

  const handleTextInputChange = (text, inputName) => {
    if (inputName === 'codigoPin' && text.length === 4) {
      confirmarCodigoPinRef.current?.focus();
    }
    if (inputName === 'confirmarCodigoPin' && text.length === 4) {
      passwordRef.current?.focus();
    }
    formik.setFieldValue(inputName, text);
  };

  return (
    <View style={styles.formContainer}>
      <CustomNumericField
        placeholder="Crea un PIN de 4 dígitos"
        inputRef={codigoPinRef}
        value={formik.values.codigoPin}
        onChange={text => handleTextInputChange(text, 'codigoPin')}
        onBlur={formik.handleBlur('codigoPin')}
        marginY={8}
        error={formik.errors.codigoPin && formik.touched.codigoPin}
        errorMessage={formik.errors.codigoPin}
        type="password"
        maxLength={4}
      />
      <CustomNumericField
        placeholder="Confirma tu PIN"
        inputRef={confirmarCodigoPinRef}
        value={formik.values.confirmarCodigoPin}
        onChange={text => handleTextInputChange(text, 'confirmarCodigoPin')}
        onBlur={formik.handleBlur('confirmarCodigoPin')}
        marginY={8}
        error={
          formik.errors.confirmarCodigoPin && formik.touched.confirmarCodigoPin
        }
        errorMessage={formik.errors.confirmarCodigoPin}
        type="password"
        maxLength={4}
      />
      <CustomNumericField
        placeholder="Contraseña de Usuario"
        inputRef={passwordRef}
        onChange={text => handleTextInputChange(text, 'password')}
        onBlur={formik.handleBlur('password')}
        value={formik.values.password}
        error={formik.errors.password && formik.touched.password}
        errorMessage={formik.errors.password}
        marginY={8}
        type="password"
      />
      <Text style={styles.formHint}>Es la contraseña con la que inicias sesión</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  cardText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  cardActions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 25,
  },
  actionButton: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginTop: 15,
  },
  actionButtonLabel: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  formContainer: {
    paddingVertical: 10,
  },
  formHint: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
  },
  modalText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
