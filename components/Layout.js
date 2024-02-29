import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Appbar} from 'react-native-paper';

const BOTTOM_APPBAR_HEIGHT = 60;

export function Container({children, bgColor = ''}) {
  return (
    <View style={{position: 'relative', flex: 1, backgroundColor: bgColor}}>
      {children}
    </View>
  );
}

export function Content({children, marginBottom = 120}) {
  return (
    <ScrollView>
      <View style={{margin: 15, marginBottom: marginBottom}}>{children}</View>
    </ScrollView>
  );
}

export function Footer({children, footerColor = '#fff'}) {
  return (
    <Appbar
      style={[
        styles.bottom,
        {
          height: BOTTOM_APPBAR_HEIGHT,
          backgroundColor: footerColor,
        },
      ]}>
      {children}
    </Appbar>
  );
}

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
});
