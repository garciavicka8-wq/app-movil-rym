import React, {useState, useEffect} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native';
import LoginFormInput from './LoginFormInput';
import {Button} from 'react-native-paper';
import {Colors, Storage, Utils} from '../../../utils';
import {ReactNativeBiometricsLegacy} from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import {useAuthContext} from '../../../context/AuthContext';
import {iniciarSesionApi, loginAppApi} from '../../../services/auth';
import {useModal} from '../../../hooks';
import {CustomModal} from '../../../components';

export default function LoginForm() {
  const modal = useModal();
  const [startAnimation, setStartAnimation] = useState(false);
  const [hasUserLoggedInBefore, setHasUserLoggedInBefore] = useState(false);
  const [verifyingUserNumber, setVerifyingUserNumber] = useState(true);
  const [fingerPrintSensorAvailable, setFingerPrintSensorAvailable] =
    useState(false);
  const [inputs, setInputs] = useState({
    usuario: '',
    password: '',
  });
  const [userName, setUserName] = useState('');
  const [touchCounter, setTouchCounter] = useState(0);
  const {setIsAuthenticated} = useAuthContext();

  useEffect(() => {
    const getUserNumber = async () => {
      setVerifyingUserNumber(true);
      const loginData = Storage.getItem('loginData', true);

      if (loginData !== null) {
        setHasUserLoggedInBefore(true);
        setInputs(state => ({
          ...state,
          usuario: loginData.userNumber,
        }));
        setUserName(loginData.userName);
      }
      await isFingerPrintSensorAvailable();
      setVerifyingUserNumber(false);
    };
    getUserNumber();
  }, []);

  useEffect(() => {
    if (touchCounter === 15) {
      setHasUserLoggedInBefore(false);
      setTouchCounter(0);
    }
  }, [touchCounter]);

  const handleChange = (text, inputName) => {
    setInputs(currentState => ({
      ...currentState,
      [inputName]: text.trim(),
    }));
  };

  const handlePress = () => {
    // VALIDAR DATOS
    if (inputs.usuario !== '' && inputs.password !== '' && !startAnimation) {
      Keyboard.dismiss();
      setStartAnimation(true);
      setTimeout(() => {
        // START LOGIN PROCESS
        initLoginProcess(inputs.usuario, inputs.password);
      }, 1000);
    }
  };

  const handleModalCancel = () => modal.setConfig({open: false});
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
  };

  const initLoginProcess = async (usuario, password) =>{
    try {
      const {user, versionApp} = await loginAppApi(usuario, password);
        Storage.setItem('usuario', user, true);
        Storage.setItem('versionApp', versionApp);
        // Esta informacion la usamos en el login para mostrar el usuario
        Storage.setItem(
          'loginData',
          {
            userNumber: user.usuario,
            userName: user.nomComercial,
          },
          true,
        );
        Utils.setLoginTime();
        await Keychain.setGenericPassword(usuario, password);
        setIsAuthenticated(true);
    } catch (error) {
      setStartAnimation(false);
      modal.setConfig({
        open: true,
        type: 'alert',
        alertTitle: 'Error de Acceso',
        contentType: 'mensaje',
        action: 'error',
        content: <Text style={styles.modalText}>{error.message}</Text>,
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
      });
    }
  }

  const startLoginProcess = async (usuario, password) => {
    try {
      await iniciarSesionApi(
        usuario,
        password,
        async (newUsuario, versionApp, error) => {
          // ALMACENAMOS EL USUARO Y LA VERSION EN EL STORAGE
          if (newUsuario && versionApp && error === null) {
            Storage.setItem('usuario', newUsuario, true);
            Storage.setItem('versionApp', versionApp);
            // Esta informacion la usamos en el login para mostrar el usuario
            Storage.setItem(
              'loginData',
              {
                userNumber: newUsuario.usuario,
                userName: newUsuario.nomComercial,
              },
              true,
            );
            Utils.setLoginTime();
            await Keychain.setGenericPassword(usuario, password);
            setIsAuthenticated(true);
          }

          // SI HAY ALGUN ERROR
          if (error !== null) {
            setStartAnimation(false);
            modal.setConfig({
              open: true,
              type: 'alert',
              alertTitle: 'Mensaje',
              contentType: 'mensaje',
              action: 'error',
              content: <Text style={styles.modalErrorMessage}>{error.message || error}</Text>,
              showCancelBtn: false,
              confirmBtnText: 'Entendido',
            });
          }
        },
      );
    } catch (e) {
      setStartAnimation(false);
      modal.setConfig({
        open: true,
        type: 'alert',
        alertTitle: 'Error',
        contentType: 'mensaje',
        action: 'error',
        content: <Text style={styles.modalErrorMessage}>{String(e.message || e)}</Text>,
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
      });
    }
  };

  const isFingerPrintSensorAvailable = async () => {
    setFingerPrintSensorAvailable(false);
    const fingerPrintLogin = Storage.getItem('fingerPrintLogin');
    const credentials = await Keychain.getGenericPassword();
    let {available, biometryType} =
      await ReactNativeBiometricsLegacy.isSensorAvailable();
    // VERIFICAMOS SI ESTA DISPONIBLE LA HUELLA DIGITAL
    setFingerPrintSensorAvailable(
      available &&
        biometryType !== undefined &&
        biometryType === 'Biometrics' &&
        credentials &&
        fingerPrintLogin !== null,
    );
  };

  const handleBiometrics = async () => {
    try {
      const {success, error} = await ReactNativeBiometricsLegacy.simplePrompt({
        promptMessage: 'Toca el sensor',
        cancelButtonText: 'Cancelar',
      });
      if (success && error == undefined) {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          Keyboard.dismiss();
          setStartAnimation(true);
          setTimeout(() => {
            // START LOGIN PROCESS
            startLoginProcess(credentials.username, credentials.password);
          }, 1000);
        }
      }
    } catch ({message}) {
      console.log(message);
    }
  };

  const handleUserNamePress = () => {
    setTouchCounter(state => state + 1);
  };

  const disableButton =
    inputs.usuario.trim().length === 0 || inputs.password.trim().length === 0;

  if (verifyingUserNumber) return null;

  return (
    <>
      {startAnimation && <AnimationLoginModal />}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Rymapp</Text>
      {hasUserLoggedInBefore ? (
        <TouchableWithoutFeedback onPress={handleUserNamePress}>
          <Text style={styles.subtitle}>
            BIENVENIDO, <Text style={styles.subtitleHighlight}>{userName ? userName.toUpperCase() : ''}</Text>
          </Text>
        </TouchableWithoutFeedback>
      ) : (
        <Text style={styles.subtitle}>
          BIENVENIDO
        </Text>
      )}

      <View style={styles.formContainer}>
        {/* CAMPO INPUT */}
        {!hasUserLoggedInBefore && (
          <LoginFormInput
            password
            label="USUARIO"
            value={inputs.usuario}
            onChange={text => handleChange(text, 'usuario')}
          />
        )}
        <LoginFormInput
          label="CONTRASEÑA"
          togglePasswordType
          value={inputs.password}
          onChange={text => handleChange(text, 'password')}
        />
        <Button
          mode="contained"
          buttonColor={Colors.primary}
          textColor="#fff"
          contentStyle={{paddingVertical: 8}}
          style={styles.loginButton}
          labelStyle={[styles.buttonLabel, {color: '#fff'}]}
          disabled={disableButton}
          onPress={handlePress}>
          →  ENTRAR
        </Button>
        <Button
          mode="contained"
          disabled={!fingerPrintSensorAvailable}
          buttonColor="#232A3B"
          textColor="#828C9B"
          contentStyle={{paddingVertical: 8}}
          style={styles.fingerprintButton}
          labelStyle={[styles.buttonLabel, {color: '#828C9B'}]}
          onPress={handleBiometrics}>
          👋  USAR HUELLA
        </Button>
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
        onAccept={handleModalAccept}
        showCloseBtn={true}
        onClose={handleModalCancel}
      >
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}

function AnimationLoginModal() {
  const modalOpacity = useState(new Animated.Value(0))[0];
  const scaleLogo = useState(new Animated.Value(0.8))[0];
  const textOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      startPulse();
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleLogo, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleLogo, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  return (
    <Animated.View style={[styles.modalContainer, {opacity: modalOpacity}]}>
      <Animated.View style={[styles.pulseContainer, {transform: [{scale: scaleLogo}]}]}>
        <Image
          source={require('../../../assets/logo.jpg')}
          style={styles.modalLogo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text style={[styles.modalText, {opacity: textOpacity}]}>
        AUTENTICANDO...
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    shadowColor: '#FF4242',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#828C9B',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 30,
  },
  subtitleHighlight: {
    color: '#FF4242',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 12,
  },
  fingerprintButton: {
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(14, 19, 33, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseContainer: {
    shadowColor: '#FF4242',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  modalLogo: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  modalText: {
    marginTop: 40,
    fontSize: 14,
    color: '#FF4242',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  modalErrorMessage: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 10,
  }
});
