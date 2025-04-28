import React from 'react';
import {Surface} from 'react-native-paper';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';

export default function CarrierCard({text, imageURL, onPress, empty}) {
  if (empty) {
    return (
      <Surface
        elevation={0}
        style={[styles.card, {backgroundColor: 'transparent'}]}></Surface>
    );
  }
  return (
    <View style={styles.listItem}>
      <Pressable onPress={onPress}>
        <Surface style={styles.listItemSurfce}>
          <FastImage
            source={{uri: imageURL, priority: FastImage.priority.normal}}
            style={styles.listItemLogo}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={{fontSize: 12}}>{text}</Text>
        </Surface>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    width: Dimensions.get('window').width / 2,
    // margin: 5,
    padding: 5,
  },
  listItemSurfce: {
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    flex: 1,
  },
  listItemLogo: {
    width: 80,
    height: 80,
  },
});
