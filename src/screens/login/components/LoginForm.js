import React, {useState, useEffect} from 'react';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LoginFormInput from './LoginFormInput';
import {Button} from 'react-native-paper';
import {Colors, Storage, Utils} from '../../../utils';
import {ReactNativeBiometricsLegacy} from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import Ribbon from './Ribbon';
import {useAuthContext} from '../../../context/AuthContext';
import {iniciarSesionApi} from '../../../services/auth';
import {useNavigation} from '@react-navigation/native';
import {APP_NAVIGATION} from '../../../constants';
const BALL = require('../../../assets/ball.png');

export default function LoginForm() {
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
  const navigation = useNavigation();

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
        startLoginProcess(inputs.usuario, inputs.password);
      }, 1000);
    }
  };

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
          // SI LA APP ESTA DESACTUALIZADA
          if (error !== null && error.update) {
            setStartAnimation(false);
            Alert.alert('Mensaje', error.message);
            return;
          }
          // SI HAY ALGUN ERROR
          if (error !== null) {
            // console.log(error.message, ' line 107');
            setStartAnimation(false);
            const tempUser = Storage.getItem('tempUser', true);
            if (tempUser) {
              Alert.alert('Mensaje', error.message, [
                {text: 'Cerrar'},
                {
                  text: 'Revisar liquidación',
                  onPress: () => {
                    navigation.navigate(APP_NAVIGATION.SCREENS.LIQUIDACION);
                  },
                },
              ]);
              return;
            }
            Alert.alert('Mensaje', error.message);
          }
        },
      );
    } catch (e) {
      setStartAnimation(false);
      Alert.alert('Error Crítico API', String(e.message || e));
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
      <View style={{width: '90%', marginTop: 40}}>
        {/* CAMPO INPUT */}
        {!hasUserLoggedInBefore && (
          <LoginFormInput
            password
            label="Usuario"
            value={inputs.usuario}
            onChange={text => handleChange(text, 'usuario')}
          />
        )}
        {hasUserLoggedInBefore && (
          <TouchableWithoutFeedback onPress={handleUserNamePress}>
            <Text
              style={{
                fontSize: 20,
                marginBottom: 10,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Hola {userName}
            </Text>
          </TouchableWithoutFeedback>
        )}
        <LoginFormInput
          label="Password"
          togglePasswordType
          value={inputs.password}
          onChange={text => handleChange(text, 'password')}
        />
        <Button
          buttonColor={Colors.primary}
          textColor="#fff"
          icon="login"
          contentStyle={{paddingVertical: 10}}
          style={{marginTop: 20}}
          uppercase
          disabled={disableButton}
          onPress={handlePress}>
          Entrar
        </Button>
        <Button
          disabled={!fingerPrintSensorAvailable}
          buttonColor={Colors.primary}
          textColor={'#fff'}
          icon="fingerprint"
          contentStyle={{paddingVertical: 10}}
          style={{marginTop: 10}}
          uppercase
          onPress={handleBiometrics}>
          Usar huella
        </Button>
      </View>
    </>
  );
}

function AnimationLoginModal() {
  const modalOpacity = useState(new Animated.Value(0))[0];
  const moveBall = useState(new Animated.Value(1000))[0];
  const rotateBall = useState(new Animated.Value(0))[0];
  const textOpacity = useState(new Animated.Value(0))[0];
  const ballOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(moveTheBall);
  }, []);

  const moveTheBall = () => {
    Animated.parallel([
      Animated.timing(moveBall, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(startBallRotation),
      Animated.timing(ballOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        delay: 500,
        useNativeDriver: true,
      }).start(),
    ]).start();
  };

  const startBallRotation = () => {
    Animated.loop(
      Animated.timing(rotateBall, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const rotatation = rotateBall.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, {opacity: modalOpacity}]}>
      <Animated.View
        style={[
          styles.ball,
          {transform: [{translateY: moveBall}], opacity: ballOpacity},
        ]}>
        <Animated.Image
          source={BALL}
          style={[styles.image, {transform: [{rotate: rotatation}]}]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.text, {opacity: textOpacity}]}>
          Iniciando sesión
        </Animated.Text>
      </Animated.View>
      {/* RED RIBBON */}
      <Ribbon />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 95,
  },
  text: {marginTop: 20, fontSize: 18},
  notificationMessage: {
    padding: 15,
    backgroundColor: Colors.lightRed,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
});
