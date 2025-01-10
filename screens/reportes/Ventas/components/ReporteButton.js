import React from 'react';
import {View, Text, TouchableWithoutFeedback, StyleSheet} from 'react-native';
import {Col} from 'react-native-easy-grid';
import {Colors} from '../../../../utils';
import {IconButton} from 'react-native-paper';

export default function ReporteButton({
  label,
  onPress,
  disabled = false,
  btnColor = Colors.lightRed,
  icon,
  iconColor = Colors.primary,
  textColor,
}) {
  if (disabled) {
    return (
      <Col style={styles.diaCol}>
        <View style={[styles.diaBtn, {backgroundColor: '#eee'}]}>
          <Text style={[styles.diaText, {color: 'gray'}]}>{label}</Text>
        </View>
      </Col>
    );
  }
  return (
    <Col style={styles.diaCol}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.diaBtn, {backgroundColor: btnColor}]}>
          {icon && <IconButton icon={icon} iconColor={iconColor} />}
          <Text
            style={{
              ...styles.diaText,
              color: textColor !== undefined ? textColor : Colors.primary,
            }}>
            {label}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </Col>
  );
}

const styles = StyleSheet.create({
  diaCol: {
    padding: 5,
  },
  diaBtn: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  diaText: {
    fontWeight: 'bold',
  },
  selectedDiaBtn: {
    backgroundColor: '#fff',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0070AF',
  },
  selectedDiaText: {
    color: '#0070AF',
    fontWeight: 'bold',
  },
});
