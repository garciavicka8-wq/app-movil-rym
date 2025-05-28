import React, {useRef, useState} from 'react';
import {Button, IconButton, Portal} from 'react-native-paper';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {Alert, View} from 'react-native';

export default function CustomScanner({onScanned}) {
  const cameraRef = useRef(null);
  const [openScanner, setOpenScanner] = useState(false);
  const [reactivate, setReactivate] = useState(true);
  const [capturingPhoto, setCapturingPhoto] = useState(false);

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

  return (
    <>
      <View style={{marginVertical: 10}}>
        <Button
          uppercase
          mode="contained"
          icon="qrcode"
          // contentStyle={{justifyContent: 'flex-end'}}
          onPress={handleOpenScanner}>
          Escanear
        </Button>
      </View>
      {/* SCANNER MODAL */}
      {openScanner && (
        <Portal>
          <QRCodeScanner
            cameraProps={{ref: cameraRef}}
            onRead={handleRead}
            flashMode={RNCamera.Constants.FlashMode.off}
            showMarker={true}
            customMarker={
              <View
                style={{
                  width: 200,
                  height: 200,
                  borderWidth: 3,
                  borderColor: 'green',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <IconButton
                  size={30}
                  iconColor="green"
                  icon="close"
                  style={{transform: [{rotateX: '45deg'}, {rotateZ: '45deg'}]}}
                />
              </View>
            }
            reactivate={reactivate}
            permissionDialogTitle="Mensaje"
            permissionDialogMessage="Necesitas permitir el uso de la camara"
            topViewStyle={{backgroundColor: 'rgba(0,0,0,0.7)'}}
            bottomViewStyle={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingTop: 10,
            }}
            bottomContent={
              <Button
                uppercase
                mode="outlined"
                icon="close"
                labelStyle={{color: 'white'}}
                onPress={handleCloseScanner}>
                Cerrar scanner
              </Button>
            }
          />
        </Portal>
      )}
    </>
  );
}
