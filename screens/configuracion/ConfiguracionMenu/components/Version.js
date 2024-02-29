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
      <Text>versión {versionApp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
  },
});
