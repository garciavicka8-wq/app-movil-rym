import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Button, Portal, Text} from 'react-native-paper';
import {RNCamera} from 'react-native-camera';
import {Colors} from '../utils';

export default function CustomPhotoCapture({
  imageUri,
  onCapture,
  onRemove,
  label = 'Tomar foto',
  disabled = false,
}) {
  const cameraRef = useRef(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current?.takePictureAsync({quality: 0.7});
      onCapture(photo.uri);
      setOpenCamera(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: imageUri}}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.previewActions}>
            <Button
              mode="outlined"
              icon="camera-retake"
              disabled={disabled}
              onPress={() => setOpenCamera(true)}
              style={styles.previewButton}>
              Cambiar foto
            </Button>
            <Button
              mode="outlined"
              icon="close"
              textColor="#EF4444"
              disabled={disabled}
              onPress={onRemove}
              style={styles.previewButton}>
              Quitar
            </Button>
          </View>
        </View>
      ) : (
        <Button
          mode="outlined"
          icon="camera"
          disabled={disabled}
          onPress={() => setOpenCamera(true)}
          style={styles.button}>
          {label}
        </Button>
      )}

      {openCamera && (
        <Portal>
          <View style={styles.fullScreenOverlay}>
            <RNCamera
              ref={cameraRef}
              style={styles.camera}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.auto}
              captureAudio={false}
              androidCameraPermissionOptions={{
                title: 'Permiso de cámara',
                message: 'Necesitamos acceso a la cámara para tomar la foto.',
                buttonPositive: 'Aceptar',
                buttonNegative: 'Cancelar',
              }}
            />
            <Text style={styles.hint}>Encuadra la foto y toma la captura</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setOpenCamera(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                disabled={capturing}
                onPress={handleCapture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              <View style={styles.closeButtonSpacer} />
            </View>
          </View>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  previewContainer: {
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  previewButton: {
    flex: 1,
    borderRadius: 12,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButtonSpacer: {
    width: 60,
  },
});
