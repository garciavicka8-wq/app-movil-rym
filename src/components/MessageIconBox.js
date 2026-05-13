import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MessageIconBox({
  iconName = 'information-outline',
  message = '',
  color = '#3B82F6',
}) {
  return (
    <View style={[styles.container, {borderLeftColor: color}]}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={24} color={color} />
      </View>
      <Text style={[styles.text, {color: color}]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
