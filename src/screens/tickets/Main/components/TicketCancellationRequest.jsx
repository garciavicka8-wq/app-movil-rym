import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import {TextInput, Button, IconButton, Card, Title, Paragraph, Modal, Portal, ActivityIndicator} from 'react-native-paper';
import {RNCamera} from 'react-native-camera';
import RNFS from 'react-native-fs';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors, Utils} from '../../../../utils';

import { uploadTicketCapture, requestTicketCancellation } from '../../../../services/tickets';
import { Storage } from '../../../../utils';

export default function TicketCancellationRequest() {
  const navigation = useNavigation();
  const route = useRoute();
  const {registro} = route.params || {};

  const [message, setMessage] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  // Cleanup temp file on unmount or change
  useEffect(() => {
    return () => {
      if (photoUri) {
        deleteTempFile(photoUri);
      }
    };
  }, [photoUri]);

  const deleteTempFile = async (uri) => {
    if (!uri) return;
    try {
      const filepath = uri.replace('file://', '');
      const exists = await RNFS.exists(filepath);
      if (exists) {
        await RNFS.unlink(filepath);
      }
    } catch (err) {
      console.log('Error cleaning up temp file:', err);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        if (photoUri) {
          await deleteTempFile(photoUri); // Clean previous photo if any
        }
        const options = {quality: 0.5, base64: false};
        const data = await cameraRef.current.takePictureAsync(options);
        setPhotoUri(data.uri);
        setShowCamera(false);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo capturar la foto');
      }
    }
  };

  const sendRequest = async () => {
    if (!message.trim()) {
      Alert.alert('Falta mensaje', 'Por favor escribe el motivo de la cancelación.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Falta evidencia', 'Por favor toma una foto del boleto.');
      return;
    }

    setLoading(true);
    try {
      const usuario = Storage.getUser();
      const formData = new FormData();
      
      formData.append('numero_usuario', usuario.usuario);
      formData.append('numero_boleto', registro.numeroBoleto); 
      formData.append('motivo', message);
      
      const filename = photoUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('captura', {
        uri: photoUri,
        name: filename,
        type: type,
      });

      await requestTicketCancellation(formData);

       Alert.alert(
        'Solicitud Enviada',
        'Tu solicitud de cancelación ha sido enviada para revisión.',
        [{text: 'Entendido', onPress: () => navigation.goBack()}]
      );

    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <RNCamera
          ref={cameraRef}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          captureAudio={false}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraInstructions}>
            Asegúrate que el boleto sea legible
          </Text>
          <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
        </View>
        <IconButton
          icon="close"
          iconColor="white"
          size={30}
          style={styles.closeCameraBtn}
          onPress={() => setShowCamera(false)}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      
      <Portal>
        <Modal visible={loading} dismissable={false} contentContainerStyle={styles.modalContent}>
           <ActivityIndicator animating={true} color={Colors.PRIMARY} size="large" />
           <Text style={styles.loadingText}>Enviando solicitud...</Text>
        </Modal>
      </Portal>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <IconButton 
            icon="close" 
            size={30} 
            onPress={() => navigation.goBack()} 
          />
          <Title style={styles.screenTitle}>Solicitud de Cancelación</Title>
          <View style={{width: 48}} />
        </View>
        
        {registro && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Ticket ID: {Utils.shortenID(registro.numeroBoleto)}</Title>
              <Paragraph>Total: {registro.total} pts</Paragraph>
              <Paragraph>Fecha: {registro.fecha} {registro.hora}</Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={styles.formSection}>

          {photoUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{uri: photoUri}} style={styles.imagePreview} />
              <IconButton
                icon="close-circle"
                iconColor="red"
                size={24}
                style={styles.removeImageBtn}
                onPress={() => setPhotoUri(null)}
              />
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Ninguna imagen adjunta</Text>
              <Button
                icon="camera"
                mode="contained"
                onPress={() => setShowCamera(true)}
                style={{marginTop: 10}}
                buttonColor="black">
                Tomar Foto
              </Button>
            </View>
          )}

          <TextInput
            value={message}
            onChangeText={setMessage}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Motivo de la cancelación"
          />



          <Button
            mode="contained"
            onPress={sendRequest}
            style={styles.sendButton}
            contentStyle={{height: 50}}
            disabled={!message.trim() || !photoUri}>
            Enviar Solicitud
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  formSection: {
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  mediaSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  mediaButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    margin: 0,
  },
  placeholderContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#999'
  },
  placeholderText: {
    color: '#666',
  },
  sendButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraInstructions: {
    color: 'white',
    marginBottom: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  closeCameraBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 16,
  }
});
