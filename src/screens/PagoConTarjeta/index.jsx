import React from 'react';
import {Platform, View} from 'react-native';
import {WebView} from 'react-native-webview';

const PagoConTarjeta = ({onTokenReceived}) => {
  const htmlUri = Platform.select({
    android: 'file:///android_asset/openpay.html',
  });

  return (
    <View style={{flex: 1}}>
      <WebView
        source={{uri: htmlUri}}
        onMessage={event => {
          const tokenData = JSON.parse(event.nativeEvent.data);
          console.log(tokenData);
        }}
      />
    </View>
  );
};

export default PagoConTarjeta;
