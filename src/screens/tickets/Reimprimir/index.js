import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Button, IconButton, Card, Modal, Portal, ActivityIndicator} from 'react-native-paper';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors, Print, Storage, Utils} from '../../../utils';
import {getServerTime} from '../../../services/http';
import {reimprimirTicketApi} from '../../../services/tickets';
import {useThermalPrinter} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';
import CustomNumericField from '../../../components/CustomNumericField';
import {APP_NAVIGATION, TICKET_TYPE} from '../../../constants';

const VENTANA_MS = 5 * 60 * 1000;

export default function Reimprimir() {
  const navigation = useNavigation();
  const route = useRoute();
  const {registro} = route.params || {};
  const thermalPrinter = useThermalPrinter();

  const [codigoPinStorage] = useState(Storage.getItem('codigoPin'));
  const [loading, setLoading] = useState(false);
  const [remainingMs, setRemainingMs] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!codigoPinStorage) {
      Alert.alert(
        'Mensaje',
        'No cuentas con un código PIN, por favor ve a Configuracion/Codigo PIN y crea uno',
        [
          {text: 'Cancelar', onPress: () => navigation.goBack()},
          {
            text: 'Ir a Código PIN',
            onPress: () => navigation.navigate(APP_NAVIGATION.SCREENS.CODIGO_PIN),
          },
        ],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    const iniciarConteo = async () => {
      try {
        const serverNow = await getServerTime();
        const transcurrido = serverNow - (registro?.timestampRegistro ?? serverNow);
        if (!isMounted) return;
        setRemainingMs(Math.max(0, VENTANA_MS - transcurrido));
      } catch (e) {
        // Si falla el reloj de servidor, dejamos que el backend sea quien decida
        if (isMounted) setRemainingMs(VENTANA_MS);
      }
    };
    iniciarConteo();

    intervalRef.current = setInterval(() => {
      setRemainingMs(prev => (prev === null ? null : Math.max(0, prev - 1000)));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik({
    initialValues: {codigoPin: ''},
    validationSchema: Yup.object().shape({
      codigoPin: Yup.string()
        .required('Este campo es requerido')
        .oneOf([codigoPinStorage], 'El PIN es incorrecto')
        .min(4, 'El pin debe ser de 4 digitos')
        .max(4, 'El pin debe ser de 4 digitos'),
    }),
    onSubmit: () => handleReimprimir(),
  });

  const [testingPrinter, setTestingPrinter] = useState(false);
  const [printerVerificada, setPrinterVerificada] = useState(false);

  const handlePruebaImpresion = async () => {
    setTestingPrinter(true);
    try {
      if (await thermalPrinter.isPrintingPossible()) {
        await thermalPrinter.print(() => Print.pruebaImpresion());
        Alert.alert('Prueba de impresión', '¿Se imprimió correctamente?', [
          {text: 'No', style: 'cancel', onPress: () => setPrinterVerificada(false)},
          {text: 'Sí', onPress: () => setPrinterVerificada(true)},
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al probar la impresora.');
    } finally {
      setTestingPrinter(false);
    }
  };

  const handleReimprimir = async () => {
    if (!registro?.numeroBoleto) return;

    setLoading(true);
    try {
      const usuario = Storage.getUser();

      if (await thermalPrinter.isPrintingPossible()) {
        const respuesta = await reimprimirTicketApi(
          usuario.usuario,
          registro.numeroBoleto,
        );

        await thermalPrinter.print(() =>
          Print.ticket(respuesta, respuesta.tipo === TICKET_TYPE.MAGICO, true),
        );

        setLoading(false);
        Alert.alert('Reimpresión completada', 'El ticket se reimprimió correctamente.', [
          {text: 'Entendido', onPress: () => navigation.goBack()},
        ]);
        return;
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Ocurrió un error al reimprimir el boleto.');
    }
  };

  const expirado = remainingMs !== null && remainingMs <= 0;
  const minutos = remainingMs !== null ? Math.floor(remainingMs / 60000) : null;
  const segundos = remainingMs !== null ? Math.floor((remainingMs % 60000) / 1000) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />

      <Portal>
        <Modal visible={loading} dismissable={false} contentContainerStyle={styles.modalContent}>
          <ActivityIndicator animating={true} color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Reimprimiendo ticket...</Text>
        </Modal>
      </Portal>

      <View style={styles.headerContainer}>
        <IconButton
          icon="close"
          iconColor="#FFFFFF"
          size={24}
          style={styles.headerIconBg}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>REIMPRIMIR TICKET</Text>
        <View style={{width: 48}} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {registro && (
          <Card style={styles.modernCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Ticket ID: {Utils.shortenID(registro.numeroBoleto)}</Text>
              <Text style={styles.cardText}>Total: {registro.total} pts</Text>
              <Text style={styles.cardText}>Registrado: {registro.fecha} {registro.hora}</Text>
            </Card.Content>
          </Card>
        )}

        <Text style={expirado ? styles.tiempoExpirado : styles.tiempoRestante}>
          {remainingMs === null
            ? 'Verificando tiempo disponible...'
            : expirado
            ? 'Ya pasaron los 5 minutos, este boleto no se puede reimprimir.'
            : `Tiempo restante para reimprimir: ${minutos}:${String(segundos).padStart(2, '0')}`}
        </Text>

        <Text style={styles.warning}>
          Este boleto solo puede reimprimirse una vez. Al confirmar, el ticket original
          impreso anteriormente ya no podrá cobrarse ni cancelarse — solo el reimpreso.
        </Text>

        <CustomNumericField
          placeholder="Código PIN"
          type="password"
          password
          value={formik.values.codigoPin}
          onChange={text => formik.setFieldValue('codigoPin', text)}
          onBlur={formik.handleBlur('codigoPin')}
          maxLength={4}
          error={formik.errors.codigoPin && formik.touched.codigoPin}
          errorMessage={formik.errors.codigoPin}
          marginY={10}
        />

        <Button
          mode="outlined"
          onPress={handlePruebaImpresion}
          style={styles.testButton}
          contentStyle={{height: 50}}
          labelStyle={styles.buttonLabel}
          textColor={Colors.primary}
          disabled={testingPrinter}>
          {testingPrinter ? 'Probando impresora...' : 'Prueba de impresión'}
        </Button>

        {printerVerificada && (
          <Button
            mode="contained"
            onPress={() => formik.handleSubmit()}
            style={styles.sendButton}
            contentStyle={{height: 50}}
            labelStyle={styles.buttonLabel}
            buttonColor={Colors.primary}
            disabled={expirado || remainingMs === null}>
            Reimprimir
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  headerContainer: {
    backgroundColor: '#0E1321',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerIconBg: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 6,
  },
  tiempoRestante: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.darkBlue,
    marginBottom: 10,
    textAlign: 'center',
  },
  tiempoExpirado: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  warning: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonLabel: {
    fontSize: 18,
  },
  testButton: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  sendButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 20,
    fontSize: 18,
  },
});
