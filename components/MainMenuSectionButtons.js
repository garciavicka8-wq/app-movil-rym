import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function MainMenuSectionButtons({
  title = '',
  titleColor = '#000',
  children,
}) {
  return (
    <View style={{marginTop: 20, paddingHorizontal: 15}}>
      <Text style={[styles.title, {color: titleColor}]}>{title}</Text>
      {/* FILA BOTONES */}
      <View style={styles.buttonsBox}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  buttonsBox: {
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
