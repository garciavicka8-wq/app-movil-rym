import React from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

export default function MenuOpcion({
  label,
  descripcion = '',
  leftIcon,
  rightIcon,
  onPress,
}) {
  return (
    <List.Item
      title={label}
      titleStyle={styles.title}
      description={descripcion}
      descriptionStyle={styles.description}
      left={props => <List.Icon {...props} icon={leftIcon} color="#64748B" />}
      right={props => <List.Icon {...props} icon={rightIcon} color="#CBD5E1" />}
      onPress={onPress}
      rippleColor="rgba(0, 0, 0, 0.05)"
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
  },
});
