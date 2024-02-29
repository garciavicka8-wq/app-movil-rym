import React from 'react';
import {Surface} from 'react-native-paper';
import {Image, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native';

export default function CarrierCard({text, imageURL, onPress, empty}) {
  if (empty) {
    return (
      <Surface
        elevation={0}
        style={[styles.card, {backgroundColor: 'transparent'}]}></Surface>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Surface style={styles.card}>
        <Image
          source={{uri: imageURL}}
          style={{width: 100, height: 50}}
          resizeMode="contain"
        />
        <Text style={{fontSize: 12}}>{text}</Text>
      </Surface>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
