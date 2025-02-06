import React from 'react';
import {Image, View} from 'react-native';
const loaderGif = require('../assets/gifs/loader.gif');

export default function LoadingIndicator() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Image
        source={loaderGif}
        style={{width: 47, height: 47}}
        // resizeMode="cover"
      />
    </View>
  );
}
