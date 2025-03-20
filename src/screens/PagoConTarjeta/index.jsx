import React from 'react';
import {Platform, View} from 'react-native';
import {WebView} from 'react-native-webview';

const PagoConTarjeta = () => {
  const htmlUri = Platform.select({
    android: 'file:///android_asset/openpay.html',
  });

  return (
    <View style={{flex: 1}}>
      <WebView
        source={{uri: htmlUri}}
        onMessage={event => {
          const response = JSON.parse(event.nativeEvent.data);
          // ERROR CREATING TOKEN
          if (response.data.description !== undefined) {
            console.log('error', response.data.description);
            return;
          }
          // TOKEN SUCCEFULLY CREATED
          const token_id = response.data.id;
          console.log('token successfully created: ', token_id);
        }}
      />
    </View>
  );
};

export default PagoConTarjeta;
