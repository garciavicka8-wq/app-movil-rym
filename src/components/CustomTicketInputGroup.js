import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CustomScanner from './CustomScanner';

export default function CustomTicketInputGroup({
  onSubmit,
  disableSubmit = undefined,
  // Texto a mostrar controlado por el padre (ej. el número de boleto ya
  // descifrado por el backend). El QR ya viene cifrado — este componente
  // nunca debe mostrar el contenido crudo escaneado.
  displayValue = undefined,
}) {
  const [hasScanned, setHasScanned] = useState(false);
  // HANDLE SCANNED DATA
  const handleScanedData = async (scannedData, capturedImageUri) => {
    setHasScanned(true);
    onSubmit(scannedData, capturedImageUri, resetInputField);
  };

  const resetInputField = () => {
    setHasScanned(false);
  };

  const textoMostrado =
    displayValue !== undefined
      ? displayValue || ''
      : hasScanned
      ? 'Código QR escaneado'
      : '';

  return (
    <>
      <View style={styles.numeroBoletoView}>
        <Text style={styles.numeroBoletoText}>{textoMostrado}</Text>
      </View>
      {/* SCANN BUTTON */}
      {!disableSubmit && <CustomScanner onScanned={handleScanedData} />}
    </>
  );
}

const styles = StyleSheet.create({
  numeroBoletoText: {
    fontSize: 20,
  },
  numeroBoletoView: {
    height: 50,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
