import React from 'react';
import {View, Text, TouchableWithoutFeedback, StyleSheet} from 'react-native';
import {Col} from 'react-native-easy-grid';
import {Colors} from '../../../../utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ReporteButton({
  label,
  onPress,
  disabled = false,
  btnColor = '#F1F5F9',
  icon,
  iconColor = '#1E293B',
  textColor = '#1E293B',
  selected = false,
}) {
  if (disabled) {
    return (
      <Col style={styles.diaCol}>
        <View style={[styles.diaBtn, styles.disabledBtn]}>
          <Text style={styles.disabledText}>{label}</Text>
        </View>
      </Col>
    );
  }

  return (
    <Col style={styles.diaCol}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[
          styles.diaBtn, 
          {backgroundColor: btnColor},
          selected && styles.selectedBtn
        ]}>
          {icon ? (
            <Icon name={icon} size={22} color={selected ? '#3B82F6' : iconColor} />
          ) : (
            <Text
              style={[
                styles.diaText,
                {color: selected ? '#3B82F6' : textColor}
              ]}>
              {label}
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Col>
  );
}

const styles = StyleSheet.create({
  diaCol: {
    padding: 6,
  },
  diaBtn: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  diaText: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedBtn: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  disabledBtn: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    elevation: 0,
  },
  disabledText: {
    fontFamily: 'Inter',
    color: '#CBD5E1',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
  },
});
