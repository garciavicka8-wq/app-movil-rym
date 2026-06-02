import React, {useRef, useState, useEffect} from 'react';
import {Button, IconButton, Portal} from 'react-native-paper';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {Alert, View, StyleSheet, Animated, Text} from 'react-native';

export default function CustomScanner({onScanned}) {
  const cameraRef = useRef(null);
  const [openScanner, setOpenScanner] = useState(false);
  const [reactivate, setReactivate] = useState(true);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (openScanner) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [openScanner, scanAnim]);

  const handleRead = async scanResult => {
    const {data} = scanResult;
    try {
      if (capturingPhoto) return;
      setCapturingPhoto(true);
      const photo = await cameraRef?.current?.takePictureAsync({quality: 0.7});
      onScanned(data, photo.uri);
      setReactivate(false);
      setOpenScanner(false);
      setCapturingPhoto(false);
    } catch (error) {
      Alert.alert('Error', error.message);
      setReactivate(false);
      setOpenScanner(false);
      setCapturingPhoto(false);
    }
  };

  const handleOpenScanner = () => {
    setOpenScanner(true);
  };

  const handleCloseScanner = () => {
    setOpenScanner(false);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="qrcode-scan"
          style={styles.scannerButton}
          labelStyle={styles.scannerButtonLabel}
          onPress={handleOpenScanner}>
          Escanear Código
        </Button>
      </View>
      {/* SCANNER MODAL */}
      {openScanner && (
        <Portal>
          <View style={styles.fullScreenOverlay}>
            <QRCodeScanner
              cameraProps={{ref: cameraRef}}
              onRead={handleRead}
              flashMode={RNCamera.Constants.FlashMode.on}
              showMarker={true}
              containerStyle={styles.scannerContainer}
              cameraStyle={styles.cameraStyle}
              customMarker={
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    {/* Corchetes */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    
                    {/* Línea de escaneo animada */}
                    <Animated.View
                      style={[
                        styles.scanLine,
                        {transform: [{translateY}]},
                      ]}
                    />
                  </View>
                </View>
              }
              reactivate={reactivate}
              permissionDialogTitle="Mensaje"
              permissionDialogMessage="Necesitas permitir el uso de la camara"
              topContent={
                <Text style={styles.scanLabel}>Apunta al código QR</Text>
              }
              bottomContent={
                <Button
                  mode="contained"
                  icon="close"
                  style={styles.closeButton}
                  labelStyle={styles.closeButtonLabel}
                  onPress={handleCloseScanner}>
                  Cerrar
                </Button>
              }
            />
          </View>
        </Portal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 15,
  },
  scannerButton: {
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    backgroundColor: '#0E1321', // Mismo azul oscuro de la barra superior
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scannerButtonLabel: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraStyle: {
    width: 280,
    height: 280,
    borderRadius: 30,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
  },
  marker: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    width: 35,
    height: 35,
    borderColor: '#34D399', // Emerald 400
    position: 'absolute',
    zIndex: 10,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 25,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 25,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 25,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 25,
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#34D399',
    position: 'absolute',
    top: 15,
    left: 0,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 5,
  },
  scanLabel: {
    fontFamily: 'Inter',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    borderRadius: 25,
    backgroundColor: '#EF4444', 
    paddingHorizontal: 25,
    height: 50,
    justifyContent: 'center',
    marginTop: 40,
  },
  closeButtonLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
