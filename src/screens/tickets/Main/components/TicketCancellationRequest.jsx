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
import CustomStatusBar from '../../../../components/CustomStatusBar';

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
      style={styles.mainContainer}>
      
      <CustomStatusBar color="darkBackground" />

      <Portal>
        <Modal visible={loading} dismissable={false} contentContainerStyle={styles.modalContent}>
           <ActivityIndicator animating={true} color={Colors.primary} size="large" />
           <Text style={styles.loadingText}>Enviando solicitud...</Text>
        </Modal>
      </Portal>

      <View style={styles.headerContainer}>
        <IconButton 
          icon="close" 
          iconColor="#FFFFFF"
          size={24} 
          style={styles.headerIconBg}
          onPress={() => navigation.goBack()} 
        />
        <Text style={styles.headerTitle}>SOLICITUD DE CANCELACIÓN</Text>
        <View style={{width: 48}} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {registro && (
          <Card style={styles.modernCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Ticket ID: {Utils.shortenID(registro.numeroBoleto)}</Text>
              <Text style={styles.cardText}>Total: {registro.total} pts</Text>
              <Text style={styles.cardText}>Fecha: {registro.fecha} {registro.hora}</Text>
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
                style={{marginTop: 15, borderRadius: 8}}
                buttonColor="#0E1321"
                labelStyle={{fontFamily: 'Inter', fontWeight: '600'}}>
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
            outlineColor="#CBD5E1"
            activeOutlineColor={Colors.primary}
          />

          <Button
            mode="contained"
            onPress={sendRequest}
            style={styles.sendButton}
            contentStyle={{height: 50}}
            buttonColor={Colors.primary}
            labelStyle={{fontFamily: 'Inter', fontWeight: 'bold', fontSize: 16}}
            disabled={!message.trim() || !photoUri}>
            Enviar Solicitud
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  headerContainer: {
    backgroundColor: '#0E1321',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerIconBg: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  formSection: {
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    fontFamily: 'Inter',
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
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: '#E2E8F0',
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
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#CBD5E1'
  },
  placeholderText: {
    fontFamily: 'Inter',
    color: '#64748B',
    fontSize: 14,
  },
  sendButton: {
    marginTop: 'auto',
    marginBottom: 20,
    borderRadius: 12,
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
