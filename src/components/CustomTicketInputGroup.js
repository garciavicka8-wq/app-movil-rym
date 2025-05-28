import React, {useRef} from 'react';
import {Alert, Keyboard, StyleSheet, Text, View} from 'react-native';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import CustomScanner from './CustomScanner';
import CustomNumericField from './CustomNumericField';

export default function CustomTicketInputGroup({
  onSubmit,
  disableSubmit = undefined,
  parentComponent = 'cancelar',
}) {
  const formik = useFormik({
    initialValues: {
      primero: '',
      segundo: '',
      tercero: '',
    },
    validationSchema: Yup.object().shape({
      primero: Yup.string()
        .matches(/^[0-9]+$/, 'Debe ser númerico')
        .required('Este campo es requerido')
        .min(4, 'Debes ingresar 4 digitos')
        .max(4, 'Debes ingresar 4 digitos'),
      segundo: Yup.string()
        .matches(/^[0-9]+$/, 'Debe ser númerico')
        .required('Este campo es requerido')
        .min(4, 'Debes ingresar 4 digitos')
        .max(4, 'Debes ingresar 4 digitos'),
      tercero: Yup.string()
        .matches(/^[0-9]+$/, 'Debe ser númerico')
        .required('Este campo es requerido')
        .min(4, 'Debes ingresar 4 digitos')
        .max(4, 'Debes ingresar 4 digitos'),
    }),
    onSubmit: data => {
      handleSubmit(data);
    },
  });
  const primeroRef = useRef(null);
  const segundoRef = useRef(null);
  const terceroRef = useRef(null);

  //   HANDLE SUBMIT
  const handleSubmit = (data, capturedImageUri) => {
    onSubmit(formik, data, capturedImageUri);
  };
  // HANDLE SCANNED DATA
  const handleScanedData = (scannedData, capturedImageUri) => {
    // VERIFICAMOS QUE SEA UN NUNERO VALIDO
    const splitElements = scannedData.split('-');
    if (scannedData.length !== 14 || splitElements.length !== 3) {
      Alert.alert('ID invalido', 'El ID debe ser de 14 dígitos', [
        {text: 'ENTENDIDO'},
      ]);
      return;
    }
    const IDBoleto = {
      primero: splitElements[0],
      segundo: splitElements[1],
      tercero: splitElements[2],
    };
    // PROCESAMOS EL NUMERO DE BOLETO
    formik.setValues(IDBoleto);
    handleSubmit(IDBoleto, capturedImageUri);
  };

  const handleTextInputChange = (text, inputName) => {
    if (inputName === 'primero' && text.length === 4) {
      segundoRef.current?.focus();
    }
    if (inputName === 'segundo' && text.length === 4) {
      terceroRef.current?.focus();
    }
    if (inputName === 'tercero' && text.length === 4) {
      Keyboard.dismiss();
    }
    formik.setFieldValue(inputName, text);
  };

  return (
    <>
      <View style={styles.inputGroup}>
        <CustomNumericField
          disabled={true}
          inputRef={primeroRef}
          value={formik.values.primero}
          error={formik.errors.primero && formik.touched.primero}
          onChange={text => handleTextInputChange(text, 'primero')}
          onBlur={formik.handleBlur('primero')}
          hideErrorMessage
          width={100}
          type="ticket"
        />
        <Text style={styles.separator}>-</Text>
        <CustomNumericField
          disabled={true}
          inputRef={segundoRef}
          value={formik.values.segundo}
          error={formik.errors.segundo && formik.touched.segundo}
          onChange={text => handleTextInputChange(text, 'segundo')}
          onBlur={formik.handleBlur('segundo')}
          hideErrorMessage
          width={100}
          type="ticket"
        />
        <Text style={styles.separator}>-</Text>
        <CustomNumericField
          disabled={true}
          inputRef={terceroRef}
          value={formik.values.tercero}
          error={formik.errors.tercero && formik.touched.tercero}
          onChange={text => handleTextInputChange(text, 'tercero')}
          onBlur={formik.handleBlur('tercero')}
          hideErrorMessage
          width={100}
          type="ticket"
        />
      </View>
      {/* SCANN BUTTON */}
      {!disableSubmit && <CustomScanner onScanned={handleScanedData} />}
    </>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  separator: {
    fontWeight: 'bold',
  },
});
