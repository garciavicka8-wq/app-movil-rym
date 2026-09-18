import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Appbar, Button, Chip, TextInput} from 'react-native-paper';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomStatusBar from '../../../components/CustomStatusBar';
import CustomNumericField from '../../../components/CustomNumericField';
import {Colors, Storage} from '../../../utils';
import {crearSolicitudSoporteApi} from '../../../services/soporte';

const TITULOS = {
  diferencia_premio: 'Diferencia para pago de premio',
  insumos: 'Solicitud de insumos',
};

const INSUMOS = [
  {value: 'rollos_papel', label: 'Rollos de papel'},
  {value: 'impresora', label: 'Impresora'},
  {value: 'cable', label: 'Cable'},
  {value: 'otro', label: 'Otro'},
];

export default function SoporteNueva() {
  const navigation = useNavigation();
  const route = useRoute();
  const {tipo} = route.params || {};
  const [loading, setLoading] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);

  const esDiferenciaPremio = tipo === 'diferencia_premio';

  const formik = useFormik({
    initialValues: {
      numeroBoleto: '',
      monto: '',
      cantidad: '',
      detalle: '',
    },
    validationSchema: Yup.object().shape(
      esDiferenciaPremio
        ? {
            numeroBoleto: Yup.string().required('Ingresa el número de boleto'),
            monto: Yup.number()
              .typeError('Ingresa un monto válido')
              .positive('El monto debe ser mayor a 0')
              .required('Ingresa el monto que necesitas'),
            detalle: Yup.string(),
          }
        : {
            detalle: Yup.string(),
          },
    ),
    onSubmit: values => handleEnviar(values),
  });

  const handleEnviar = async values => {
    if (!esDiferenciaPremio && !insumoSeleccionado) {
      Alert.alert('Falta información', 'Selecciona el insumo que necesitas.');
      return;
    }

    setLoading(true);
    try {
      const usuario = Storage.getUser();
      const payload = esDiferenciaPremio
        ? {
            numero_boleto: values.numeroBoleto,
            monto_solicitado: Number(values.monto),
          }
        : {insumo: insumoSeleccionado, cantidad: values.cantidad || null};

      await crearSolicitudSoporteApi(
        usuario.usuario,
        tipo,
        values.detalle || null,
        payload,
      );

      Alert.alert(
        'Solicitud enviada',
        'El panel recibió tu solicitud, te avisaremos cuando la resuelvan.',
        [{text: 'Entendido', onPress: () => navigation.goBack()}],
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error al enviar la solicitud.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content
          color="white"
          titleStyle={styles.appBarTitle}
          title={TITULOS[tipo] || 'Soporte'}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {esDiferenciaPremio ? (
          <>
            <Text style={styles.label}>Número de boleto</Text>
            <CustomNumericField
              type="digits"
              placeholder="Número de boleto"
              value={formik.values.numeroBoleto}
              onChange={text => formik.setFieldValue('numeroBoleto', text)}
              onBlur={formik.handleBlur('numeroBoleto')}
              error={formik.errors.numeroBoleto && formik.touched.numeroBoleto}
              errorMessage={formik.errors.numeroBoleto}
              marginY={8}
            />

            <Text style={styles.label}>Monto que necesitas</Text>
            <CustomNumericField
              type="currency"
              prefix="$"
              placeholder="$0.00"
              value={formik.values.monto}
              onChange={value => formik.setFieldValue('monto', value)}
              onBlur={formik.handleBlur('monto')}
              error={formik.errors.monto && formik.touched.monto}
              errorMessage={formik.errors.monto}
              marginY={8}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>¿Qué insumo necesitas?</Text>
            <View style={styles.chipsContainer}>
              {INSUMOS.map(insumo => (
                <Chip
                  key={insumo.value}
                  selected={insumoSeleccionado === insumo.value}
                  onPress={() => setInsumoSeleccionado(insumo.value)}
                  style={styles.chip}
                  selectedColor={Colors.primary}>
                  {insumo.label}
                </Chip>
              ))}
            </View>

            <Text style={styles.label}>Cantidad (opcional)</Text>
            <CustomNumericField
              type="number"
              placeholder="Cantidad"
              value={formik.values.cantidad}
              onChange={text => formik.setFieldValue('cantidad', text)}
              marginY={8}
            />
          </>
        )}

        <Text style={styles.label}>Detalle (opcional)</Text>
        <TextInput
          value={formik.values.detalle}
          onChangeText={text => formik.setFieldValue('detalle', text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.textArea}
          placeholder="Escribe cualquier detalle adicional"
          outlineColor="#CBD5E1"
          activeOutlineColor={Colors.primary}
        />

        <Button
          mode="contained"
          onPress={() => formik.handleSubmit()}
          loading={loading}
          disabled={loading}
          style={styles.sendButton}
          contentStyle={{height: 50}}
          buttonColor={Colors.primary}>
          Enviar solicitud
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  textArea: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 12,
  },
});
