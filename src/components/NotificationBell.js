import React from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {APP_NAVIGATION} from '../constants';

// `style` va al IconButton: los headers propios de las pantallas principales
// (rediseño 8.0.0) le pasan su fondo redondo y el globo se pega a su esquina.
export default function NotificationBell({color = 'white', style}) {
  const {unreadCount} = useSelector(state => state.notifications);
  const navigation = useNavigation();

  return (
    <View style={style ? styles.containerConFondo : styles.container}>
      <IconButton
        icon="bell"
        iconColor={color}
        size={24}
        style={style}
        onPress={() => {
          navigation.navigate(APP_NAVIGATION.SCREENS.NOTIFICACIONES);
        }}
      />
      {unreadCount > 0 && (
        <View style={[styles.badge, style && styles.badgeConFondo]}>
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
  containerConFondo: {
    position: 'relative',
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
  badgeConFondo: {
    top: -4,
    right: -4,
    elevation: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
