import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  Vibration,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';

const {width, height} = Dimensions.get('window');

export default function App() {
  const cameraRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const openCamera = () => {
    setCapturedPhoto(null);
    setIsModalVisible(true);
  };

  const closeCamera = () => {
    setIsModalVisible(false);
  };

  const onQRCodeRead = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({quality: 0.7});
      Vibration.vibrate(200);
      setCapturedPhoto(photo.uri);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Abrir cámara" onPress={openCamera} />

      {capturedPhoto && (
        <>
          <Text style={styles.resultText}>Foto capturada:</Text>
          <Image source={{uri: capturedPhoto}} style={styles.photo} />
        </>
      )}

      <Modal visible={isModalVisible} animationType="slide" hardwareAccelerated>
        <QRCodeScanner
          onRead={onQRCodeRead}
          reactivate={false}
          cameraProps={{ref: cameraRef}}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topViewStyle={{flex: 0}}
          bottomViewStyle={{flex: 0}}
          containerStyle={{height: '100%'}}
          cameraStyle={{height: '100%'}}
          showMarker
          customMarker={
            <View style={styles.markerContainer}>
              <View style={styles.marker} />
            </View>
          }
        />

        <TouchableOpacity style={styles.closeButton} onPress={closeCamera}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
  },
  photo: {
    marginTop: 10,
    width: 200,
    height: 300,
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontSize: 14,
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  marker: {
    width: width * 0.7,
    height: height * 0.5,
    borderColor: 'lime',
    borderWidth: 3,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
});
