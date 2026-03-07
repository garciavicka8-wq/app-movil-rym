import React from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {APP_NAVIGATION} from '../constants';

export default function NotificationBell({color = 'white'}) {
  const {unreadCount} = useSelector(state => state.notifications);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <IconButton
        icon="bell"
        iconColor={color}
        size={24}
        onPress={() => {
          navigation.navigate(APP_NAVIGATION.SCREENS.NOTIFICACIONES);
        }}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 5,
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
