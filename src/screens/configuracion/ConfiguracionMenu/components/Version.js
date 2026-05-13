import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import VersionCheck from 'react-native-version-check';

export default function Version() {
  const [versionApp, setVersionApp] = useState('');

  useEffect(() => {
    setVersionApp(VersionCheck.getCurrentVersion());
  }, []);

  return (
    <View style={styles.box}>
      <Text style={styles.text}>VERSIÓN {versionApp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    padding: 15,
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 1,
  },
});
