import React from 'react';
import {Text, View} from 'react-native';
const alertTypes = {
  backgroundColor: {
    info: 'rgba(0,0,255, 0.075)',
    danger: 'rgba(255,0,0, 0.075)',
  },
  color: {
    info: 'blue',
    danger: 'red',
  },
};

export default function CustomAlert({text, type = 'info'}) {
  return (
    <View
      style={{
        padding: 15,
        backgroundColor: alertTypes.backgroundColor[type],
      }}>
      <Text
        style={{
          color: alertTypes.color[type],
        }}>
        {text}
      </Text>
    </View>
  );
}
