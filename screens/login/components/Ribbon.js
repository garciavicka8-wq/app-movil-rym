import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Colors} from '../../../utils';

export default function Ribbon() {
  return <View style={styles.ribbon}></View>;
}

const styles = StyleSheet.create({
  ribbon: {
    width: '100%',
    height: 30,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: 0,
  },
});
