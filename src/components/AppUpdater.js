import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import axios from 'axios';
import { RYM_API_URL, RYM_BASE_URL } from '../constants';
import { IconButton } from 'react-native-paper';

export default function AppUpdater() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCellular, setIsCellular] = useState(false);
  const [installPath, setInstallPath] = useState(null);
  // Fuente de verdad del tamaño total: se captura en begin y se reutiliza en progress
  // para evitar que Apache (chunked encoding) reporte valores distintos entre callbacks.
  const contentLengthRef = React.useRef(-1);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsCellular(state.type === 'cellular');
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsCellular(state.type === 'cellular');
    });

    const updateListener = DeviceEventEmitter.addListener('FORCE_UPDATE', (data) => {
      if (data && data.latest_version) {
        setUpdateInfo(data.latest_version);
        // También podemos hacer un localFile exists check aqui o simplemente forzar UI
        handleForceUpdateCheck(data.latest_version);
      }
    });

    cleanupOldApks(null);
    checkForUpdates();

    return () => {
      unsubscribe();
      updateListener.remove();
    };
  }, []);

  const handleForceUpdateCheck = async (latestData) => {
    try {
      const localFile = `${RNFS.DocumentDirectoryPath}/rymapp2_update_${latestData.version_code}.apk`;
      const exists = await RNFS.exists(localFile);
      if (exists) {
        setInstallPath(localFile);
        setDownloading(true);
        setProgress(100);
      }
    } catch (e) {
      console.log('Error in force update check:', e);
    }
  };

  const cleanupOldApks = async (latestVersionCode) => {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.startsWith('rymapp2_update_') && file.name.endsWith('.apk')) {
          // Si nos pasan un latestVersionCode, evitamos borrar ese archivo en específico
          if (latestVersionCode && file.name === `rymapp2_update_${latestVersionCode}.apk`) {
            continue;
          }
          await RNFS.unlink(file.path);
          console.log(`Borrando APK residual o antiguo: ${file.name}`);
        }
      }
    } catch (error) {
      console.log('Error limpiando APKs (AppUpdater):', error);
    }
  };

  const checkForUpdates = async () => {
    try {
      if (!RYM_API_URL) return;
      const response = await axios.get(`${RYM_API_URL}/app-versions/latest`);
      const data = response.data;
      
      const currentBuild = parseInt(DeviceInfo.getBuildNumber(), 10);
      
      // Si la API devuelve un version_code numéricamente mayor:
      if (data && data.version_code && data.version_code > currentBuild) {
        setUpdateInfo(data);
        
        // Limpiamos los APKs que NO sean de esta nueva versión
        await cleanupOldApks(data.version_code);
        
        // Verificamos si esta versión ya fue descargada previamente (por ej. antes de cerrar la app)
        const localFile = `${RNFS.DocumentDirectoryPath}/rymapp2_update_${data.version_code}.apk`;
        const exists = await RNFS.exists(localFile);
        if (exists) {
          setInstallPath(localFile);
          setDownloading(true);
          setProgress(100);
        }
      } else {
        // No hay actualización, limpiamos todos los remanentes
        await cleanupOldApks(null);
      }
    } catch (error) {
      console.log('Error checking updates (AppUpdater):', error?.response?.data || error);
    }
  };

  const startDownload = (url, updatedVersionCode) => {
    setDownloading(true);
    setProgress(0);
    contentLengthRef.current = -1;
    const localFile = `${RNFS.DocumentDirectoryPath}/rymapp2_update_${updatedVersionCode}.apk`;
    setInstallPath(localFile);

    let finalDownloadUrl = url;
    if (finalDownloadUrl && (finalDownloadUrl.includes('127.0.0.1:8000') || finalDownloadUrl.includes('localhost:8000'))) {
      finalDownloadUrl = finalDownloadUrl
        .replace('http://127.0.0.1:8000', RYM_BASE_URL)
        .replace('http://localhost:8000', RYM_BASE_URL)
        .replace('https://127.0.0.1:8000', RYM_BASE_URL)
        .replace('https://localhost:8000', RYM_BASE_URL);
    }

    RNFS.exists(localFile).then((exists) => {
      if (exists) return RNFS.unlink(localFile);
      return true;
    }).then(() => {
      const { promise } = RNFS.downloadFile({
        fromUrl: finalDownloadUrl,
        toFile: localFile,
        begin: (res) => {
          // OkHttp reporta body.contentLength() = -1 cuando Apache usa chunked encoding,
          // incluso si PHP seteó Content-Length en los headers. Como fallback leemos el
          // header raw, que sí llega aunque OkHttp lo ignore para el streaming.
          const rawCL = parseInt(
            res.headers?.['Content-Length'] ??
            res.headers?.['content-length'] ??
            '-1',
            10
          );
          const total = res.contentLength > 0 ? res.contentLength : rawCL;
          contentLengthRef.current = total;
          console.log('[AppUpdater] begin — contentLength:', res.contentLength, '| header raw:', rawCL, '| usando:', total);
          if (total <= 0) {
            setProgress(-1);
          }
        },
        progress: (res) => {
          const total = contentLengthRef.current;
          if (total > 0 && res.bytesWritten >= 0) {
            const pct = (res.bytesWritten / total) * 100;
            setProgress(Math.min(99, Math.max(0, Math.round(pct))));
          }
          // Si total <= 0, permanece en -1 (muestra "Descargando...")
        },
        progressDivider: 5,
      });

      promise.then((r) => {
        if (r.statusCode === 200) {
          setProgress(100);
          installApp(localFile);
        } else {
          setDownloading(false);
          setProgress(0);
          Alert.alert('Error', `No se pudo descargar la actualización (${r.statusCode}). Intenta de nuevo.`);
        }
      }).catch((err) => {
        setDownloading(false);
        setProgress(0);
        console.log('Download error:', err);
        Alert.alert('Error', 'No se pudo descargar la actualización. Verifica tu conexión e intenta de nuevo.');
      });
    }).catch(err => {
      setDownloading(false);
      setProgress(0);
      console.log('FS error:', err);
    });
  };

  const installApp = async (filePath) => {
    try {
      await FileViewer.open(filePath, { 
        showOpenWithDialog: false,
        showAppsPicker: false,
      });
    } catch (e) {
      console.log('Error opening APK for installation:', e);
    }
  };

  const handleStartDownload = () => {
    if (updateInfo) {
      startDownload(updateInfo.apk_url, updateInfo.version_code);
    }
  };

  if (!updateInfo) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <IconButton icon="cloud-download" iconColor="#1a237e" size={60} style={styles.icon} />
          
          <Text style={styles.title}>Nueva actualización</Text>
          <Text style={styles.subtitle}>
            Versión {updateInfo.version} disponible.
          </Text>
          
          {updateInfo.release_notes ? (
            <Text style={styles.notes}>{updateInfo.release_notes}</Text>
          ) : null}

          {isCellular && !downloading ? (
            <Text style={styles.cellularWarning}>
              Estás usando datos móviles. Te sugerimos conectarte a una red Wi-Fi antes de descargar.
            </Text>
          ) : null}

          {!downloading ? (
            <TouchableOpacity style={styles.downloadButton} onPress={handleStartDownload}>
              <Text style={styles.downloadButtonText}>Iniciar descarga</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.progressContainer}>
              {progress < 100 ? (
                <>
                  <ActivityIndicator size="small" color="#1a237e" />
                  <Text style={styles.progressText}>
                    {progress >= 0 ? `Descargando: ${progress}%` : 'Descargando...'}
                  </Text>
                </>
              ) : (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <Text style={styles.progressText}>APK listo para instalar</Text>
                  <TouchableOpacity 
                    style={[styles.downloadButton, { marginTop: 15, paddingVertical: 10 }]} 
                    onPress={() => installApp(installPath || `${RNFS.DocumentDirectoryPath}/rymapp2_update_${updateInfo.version_code}.apk`)}
                  >
                    <Text style={styles.downloadButtonText}>Instalar actualización</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ marginTop: 20 }} 
                    onPress={() => {
                        setDownloading(false);
                        setProgress(0);
                        if(installPath) RNFS.unlink(installPath).catch(() => null);
                    }}
                  >
                    <Text style={{ color: '#1a237e', textDecorationLine: 'underline', fontSize: 13, fontWeight: 'bold' }}>
                      ¿Error de análisis? Descargar de nuevo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          {downloading && (
            <Text style={styles.warning}>
              Por favor, no cierres la aplicación durante este proceso.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  icon: {
    margin: 0,
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontStyle: 'italic',
  },
  cellularWarning: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 15,
  },
  downloadButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: '100%',
  },
  progressText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  warning: {
    color: '#ff9800',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 12,
    fontWeight: '500',
  }
});
