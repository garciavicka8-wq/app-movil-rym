import React from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';

export default function CarrierCard({text, imageURL, onPress, empty}) {
  if (empty) {
    return <View style={styles.emptyCard} />;
  }
  return (
    <Pressable onPress={onPress} style={styles.listItem}>
      <View style={styles.listItemSurface}>
        <FastImage
          source={{uri: imageURL, priority: FastImage.priority.normal}}
          style={styles.listItemLogo}
          resizeMode={FastImage.resizeMode.contain}
        />
        <Text style={styles.text} numberOfLines={1}>{text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: 15,
  },
  listItem: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: 15,
  },
  listItemSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listItemLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
