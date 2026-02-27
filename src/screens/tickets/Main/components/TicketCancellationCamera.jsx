import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useNavigation, useRoute} from '@react-navigation/native';

export default function TicketCancellationCamera() {
  const cameraRef = useRef(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const {registro} = route.params || {};

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = {quality: 0.5, base64: true};
        const data = await cameraRef.current.takePictureAsync(options);
        setCapturedPhoto(data.uri);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo capturar la foto');
      }
    }
  };

  const confirmCancellation = () => {
    // Implement here the logic to send the photo and cancel the ticket
    Alert.alert(
      'Foto Capturada',
      'La foto ha sido capturada. Aquí se procedería con la cancelación.',
      [{text: 'OK', onPress: () => navigation.goBack()}],
    );
  };

  const retake = () => {
    setCapturedPhoto(null);
  };

  if (!registro) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: 'white'}}>No se seleccionó ningún boleto.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.btn, styles.btnRetake, {marginTop: 20}]}>
          <Text style={styles.btnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{uri: capturedPhoto}} style={styles.preview} />
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={confirmCancellation}
            style={[styles.btn, styles.btnConfirm]}>
            <Text style={styles.btnText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={retake}
            style={[styles.btn, styles.btnRetake]}>
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        captureAudio={false}
      />

      <View style={styles.overlay}>
        <Text style={styles.instructions}>
          Toma una foto del boleto {registro.numeroBoleto}
        </Text>
        <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeBtn}>
        <Text style={styles.closeText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  instructions: {
    color: 'white',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureBtnInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  btn: {
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    elevation: 5
  },
  btnConfirm: {
    backgroundColor: '#2ecc71',
  },
  btnRetake: {
    backgroundColor: '#e74c3c',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
