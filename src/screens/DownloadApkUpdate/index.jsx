import {Alert, Linking, Platform, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import RNFS from 'react-native-fs';
import {useState} from 'react';

export default function DownloadApkUpdate() {
  const [isCancelled, setIsCancelled] = useState(false);

  const downloadFile = async (url, fileName) => {
    try {
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // Scoped Storage

      const currentDownloadTask = await RNFS.downloadFile({
        fromUrl: url,
        toFile: destPath,
        background: true,
        begin: res => {
          console.log('Descarga iniciada:', res);
        },
        progress: res => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Progreso de descarga: ${progress.toFixed(2)}%`);
        },
        connectionTimeout: 15000, // Tiempo en ms (15 segundos)
        readTimeout: 15000,
      }).promise;

      if (currentDownloadTask.statusCode === 200) {
        console.log('Descarga completa', `Archivo guardado en: ${destPath}`);
        if (Platform.OS === 'android') {
          Linking.openURL(`file://${destPath}`);
        }
      } else {
        Alert.alert('Error', 'No se pudo completar la descarga.');
      }
    } catch (error) {
      console.error('Error descargando archivo:', error);
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
  };

  return (
    <View>
      <Button
        onPress={() =>
          downloadFile(
            'https://test-rym.mecaorg.com/downloads/rymapp-bug-fixed-v4.6.1.apk',
            'rym-update.apk',
          )
        }>
        DownloadFile
      </Button>
      <Button onPress={handleCancel}>Cancel download</Button>
    </View>
  );
}
