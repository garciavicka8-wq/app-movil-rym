import React from 'react';
import {Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';

export default function MessageIconBox({
  iconName = 'information-outline',
  message = '',
}) {
  return (
    <View
      style={{
        borderLeftWidth: 2,
        borderLeftColor: '#2196f3',
        marginVertical: 10,
        display: 'flex',
        flexDirection: 'row',
        paddingVertical: 10,
        backgroundColor: 'white',
      }}>
      <View>
        <IconButton icon={iconName} iconColor="#2196f3"></IconButton>
      </View>
      <Text style={{flex: 1, flexWrap: 'wrap', color: '#2196f3', fontSize: 16}}>
        {message}
      </Text>
    </View>
  );
}
