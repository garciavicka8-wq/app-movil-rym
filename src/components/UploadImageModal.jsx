import {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {
  ActivityIndicator,
  Banner,
  Button,
  IconButton,
  Portal,
} from 'react-native-paper';
import {uploadTicketCapture} from '../services/tickets';
import {uploadDepositReceipt} from '../services/reports';

export default function UploadImageModal({onUploaded, onClose, type}) {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [takingPhoto, setTakingFoto] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      setPhoto(null);
      setTakingFoto(false);
      setUploading(false);
      // console.log('unmounted');
    };
  }, []);

  const handleClose = () => {
    if (takingPhoto || uploading) return false;
    if (onClose) {
      onClose();
    }
  };

  const takePicture = async () => {
    if (takingPhoto || cameraRef.current === undefined) return;

    setTakingFoto(true);
    const data = await cameraRef.current.takePictureAsync({
      quality: 0.1,
      base64: true,
    });
    // console.log(data.uri);
    setPhoto(data);
    setTakingFoto(false);
  };

  const retryTakephoto = async () => {
    setPhoto(null);
  };

  const uploadPhoto = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      const filename = photo.uri.substring(photo.uri.lastIndexOf('/') + 1);
      const formData = new FormData();

      formData.append('capture', {
        uri: photo.uri,
        name: filename,
        type: 'image/jpeg',
      });

      let imageUrl = '';

      if (type === 'prize-ticket') {
        imageUrl = await uploadTicketCapture(formData);
      } else if (type === 'deposit-receipt') {
        imageUrl = await uploadDepositReceipt(formData);
      }

      onUploaded(imageUrl);
    } catch (error) {
      console.log(error.message);
      setUploading(false);
    }
  };

  return (
    <Portal>
      {/* OVERLAY */}
      <View style={styles.overlay}>
        {/* DIALOG */}
        <View style={styles.dialog}>
          {/* HEADER */}
          <View style={styles.header}>
            {/* TITLE */}
            <Text style={styles.title}>
              {!uploading ? 'Tomar Foto' : 'Enviando Captura'}
            </Text>
            {!uploading ? (
              <IconButton icon={'close'} onPress={handleClose} />
            ) : (
              <ActivityIndicator />
            )}
          </View>
          {/* CONTENT */}
          <View style={styles.content}>
            {photo === null && !uploading && (
              <>
                {/* CAMERA VIEW */}
                <RNCamera
                  ref={cameraRef}
                  style={styles.camera}
                  type={RNCamera.Constants.Type.back}
                  androidCameraPermissionOptions={{
                    title: 'Permiso para usar la cámara',
                    message: 'La aplicación necesita acceso a tu cámara',
                    buttonPositive: 'Aceptar',
                    buttonNegative: 'Cancelar',
                  }}
                  flashMode={RNCamera.Constants.FlashMode.off}
                  captureAudio={false}>
                  {/* GUIDE OVERLAY */}
                  <View style={styles.guideOverlay}>
                    <View style={styles.guide}></View>
                  </View>
                </RNCamera>
                {/* ALERT */}
                <Banner visible={true} elevation={0}>
                  {type === 'prize-ticket'
                    ? 'Coloca el boleto dentro del recuadro punteado. Importante: el boleto tiene que ser fisico de lo contrario el pago será rechazado'
                    : 'Coloca el comprobante dentro del recuadro punteado.'}
                </Banner>
              </>
            )}
            {photo !== null && (
              <>
                <Image source={{uri: photo.uri}} style={styles.capture} />
                {!uploading && (
                  <Banner visible={true} elevation={0}>
                    Se enviará la captura para que sea revisada y validada.
                  </Banner>
                )}
              </>
            )}
          </View>
          {/* ACTIONS */}
          {!uploading && (
            <View style={styles.actions}>
              {photo === null ? (
                <Button
                  mode="contained"
                  icon={'camera'}
                  onPress={takePicture}
                  disabled={takingPhoto}>
                  {!takingPhoto ? 'Capturar' : 'Capturando...'}
                </Button>
              ) : (
                <>
                  <Button
                    mode="outlined"
                    icon={'refresh'}
                    onPress={retryTakephoto}>
                    Reintentar
                  </Button>
                  <Button mode="contained" icon={'send'} onPress={uploadPhoto}>
                    Enviar
                  </Button>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dialog: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  header: {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
  },
  content: {},
  camera: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
  },
  capture: {
    width: '100%',
    height: 300,
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guide: {
    width: 200, // Tamaño del cuadro guía
    height: 250,
    borderWidth: 2,
    borderColor: '#fff', // Color del borde
    borderStyle: 'dashed', // Estilo del borde
    backgroundColor: 'transparent', // Fondo transparente
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
});
