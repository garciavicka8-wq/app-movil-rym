import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CustomScanner from './CustomScanner';

export default function CustomTicketInputGroup({
  onSubmit,
  disableSubmit = undefined,
}) {
  const [numeroBoleto, setNumeroBoleto] = useState('');
  // HANDLE SCANNED DATA
  const handleScanedData = async (scannedData, capturedImageUri) => {
    setNumeroBoleto(scannedData);
    onSubmit(scannedData, capturedImageUri, resetInputField);
  };

  const resetInputField = () => {
    setNumeroBoleto('');
  };

  return (
    <>
      <View style={styles.numeroBoletoView}>
        <Text style={styles.numeroBoletoText}>{numeroBoleto}</Text>
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
