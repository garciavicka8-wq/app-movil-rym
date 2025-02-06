import React from 'react';
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
      description={descripcion}
      left={props => <List.Icon {...props} icon={leftIcon} />}
      right={props => <List.Icon {...props} icon={rightIcon} />}
      onPress={onPress}
    />
  );
}
