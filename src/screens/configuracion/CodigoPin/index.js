import React, {useEffect, useState, useRef} from 'react';
import {StatusBar, Alert, Text} from 'react-native';
import {useFormik} from 'formik';
import {useCustomNavigation, useLogout, useModal} from '../../../hooks';
import * as Yup from 'yup';
import {Colors, Storage} from '../../../utils';
import {CustomModal} from '../../../components';
import {Container, Content} from '../../../components/Layout';
import {Button, Card} from 'react-native-paper';
import {usuarioAutenticado} from '../../../services/auth';
import {APP_NAVIGATION} from '../../../constants';
import CustomNumericField from '../../../components/CustomNumericField';
import {ERROR_CODE_NAMES} from '../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import { saveUserAppPINCodeAPi } from './services';

export default function CodigoPin() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [usuario, setUsuario] = useState({usuario: ''});
  const [verificandoCodigoPin, setVerificandoCodigoPin] = useState(true);
  const [cardContent, setCardContent] = useState({
    text: '',
    buttonText: '',
  });
  const modal = useModal();
  const navigation = useCustomNavigation();
  const {logout} = useLogout();
  const netInfo = useNetInfo();
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
    // VERIFICAR CONEXION
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      comprobarCodigoPin();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);
  // COMPROBAR SI YA EXISTE UN CODIGO PIN DEFINIDO
  const comprobarCodigoPin = async () => {
    try {
      setVerificandoCodigoPin(true);
      const existePin = Storage.getItem('codigoPin');
      // SI EXISTE CODIGO PIN O NO
      if (existePin) {
        setCardContent({
          text: 'Parece que ya tienes un PIN definido, Quieres cambiarlo?',
          buttonText: 'Cambiar código pin',
          action: 'actualizar',
        });
      } else {
        setCardContent({
          text: ' El código PIN sirve para proteger las transacciones que realices por medio de esta app de modo que sólo quién conózca el PIN podrá realizar dichas operaciones.',
          buttonText: 'Crear código pin',
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
  // HANDLE OPEN MODAL
  const handleOpenModal = () => {
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: cardContent.action == 'actualizar' ? 'Cambiar' : 'Crear',
      action: cardContent.action,
      contentType: cardContent.action,
      showCancelBtn: true,
      confirmBtnText: 'Aceptar',
    });
  };
  // GUARDAR CODIGO PIN
  const guardarCodigoPin = async data => {
    try {
      // VERIFICAR CONEXION
      if (!netInfo?.isConnected) {
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Guardando pin',
      });
      // VERIFICAR AUTENTICACION
      await usuarioAutenticado(
        usuario.usuario,
        data.password,
        async (autenticado, error) => {
          // SI HAY ERROR
          if (error) {
            if (
              error.message == 'DEVICE_NOT_LINKED' ||
              error.message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
              error.message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
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
              error: <Text>{error.message}</Text>,
              confirmBtnText: 'Entendido',
            });
            return;
          }
          // SI EL USUARIO ESTA AUTENTICADO
          if (autenticado) {
            Storage.setItem('codigoPin', data.codigoPin);
            modal.setConfig({
              type: 'alert',
              alertTitle: 'Mensaje',
              contentType: 'mensaje',
              action: 'autenticado',
              showCancelBtn: false,
              content: <Text>Pin guardado correctamente</Text>,
              confirmBtnText: 'Entendido',
            });
          }
        },
      );
    } catch ({message}) {
      if (message === 'DEVICE_NOT_LINKED') {
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
        confirmBtnText: 'Entendido',
      });
    }
  };

  const savePINCode = async ({password, codigoPin}) =>{
    // VERIFICAR CONEXION
      if (!netInfo?.isConnected) {
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Guardando pin',
      });
      
      try {
        const data = await saveUserAppPINCodeAPi(password, codigoPin);
      Storage.setItem('codigoPin', data.codigoPin);
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'mensaje',
        action: 'autenticado',
        showCancelBtn: false,
        content: <Text>Pin guardado correctamente</Text>,
        confirmBtnText: 'Entendido',
      });
      } catch (error) {
        modal.setConfig({
          type: 'alert',
          alertTitle: 'Mensaje',
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          error: <Text>{error.message}</Text>,
          confirmBtnText: 'Entendido',
        });
      }
  }

  return (
    <Container>
      {navigation.isFocused && <StatusBar backgroundColor={Colors.dark} />}
      <Content>
        {verificandoCodigoPin && (
          <Text style={{marginVertical: 20, fontSize: 16}}>
            Verificando código pin...
          </Text>
        )}
        {!verificandoCodigoPin && (
          <Card style={{backgroundColor: 'white'}}>
            <Card.Content>
              <Text style={{marginVertical: 20, fontSize: 16}}>
                {cardContent.text}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                uppercase
                mode="contained"
                buttonColor="black"
                onPress={handleOpenModal}>
                {cardContent.buttonText}
              </Button>
            </Card.Actions>
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
    <>
      <CustomNumericField
        placeholder="Crea un PIN de 4 digitos"
        inputRef={codigoPinRef}
        value={formik.values.codigoPin}
        onChange={text => handleTextInputChange(text, 'codigoPin')}
        onBlur={formik.handleBlur('codigoPin')}
        marginY={10}
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
        marginY={10}
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
        marginY={10}
        type="password"
      />
      <Text>Es la contraseña con la que inicias sesión</Text>
    </>
  );
};
