import React, {useEffect, useState, useLayoutEffect} from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Storage} from '../../../utils';
import CreditCard from '../../../components/CreditCard';
import CustomStatusBar from '../../../components/CustomStatusBar';
import ServerClock from '../../../components/ServerClock';
import {useSelector} from 'react-redux';
import {useCustomNavigation} from '../../../hooks';
import {APP_NAVIGATION} from '../../../constants';
import CollapsedTotal from './components/CollapsedTotal';
import {MENU_ITEMS} from './components/constants';
import {useNavigation} from '@react-navigation/native';

export default function Main() {
  const {registrosAlMomento} = useSelector(state => state.cliente);
  const navigation = useNavigation();
  const customNav = useCustomNavigation();
  const [userName, setUserName] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loginData = Storage.getItem('loginData', true);
    if (loginData !== null) {
      setUserName(loginData.userName);
    }
  }, []);

  const handleNavigate = routeName => {
    customNav.navigate(APP_NAVIGATION.SCREENS[routeName]);
  };

  const footerVisible = registrosAlMomento.length > 0;

  return (
    <>
      <CustomStatusBar color="darkBackground" />
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>{userName ? userName.toUpperCase() : 'USUARIO'}</Text>
            <ServerClock style={styles.headerClock} />
          </View>
        <View style={styles.headerIcons}>
          <IconButton 
            icon="bell" 
            iconColor="#FBBF24" 
            size={24} 
            style={styles.headerIconBg} 
            onPress={() => navigation.navigate(APP_NAVIGATION.SCREENS.NOTIFICACIONES)}
          />
          <IconButton 
            icon="cog" 
            iconColor={Colors.white} 
            size={24} 
            style={styles.headerIconBg} 
            onPress={() => navigation.navigate(APP_NAVIGATION.SCREENS.CONFIG_MENU)}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CreditCard
          backDropColor="transparent"
          cardColor={Colors.primary}
          iconBgColor="rgba(255,255,255,0.2)"
        />

        {/* <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: '#10B981'}]}>12</Text>
            <Text style={styles.statLabel}>PAGADOS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: '#EF4444'}]}>3</Text>
            <Text style={styles.statLabel}>CANCELADOS</Text>
          </View>
        </View> */}

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Ticket Plus</Text>
          <View style={styles.menuListCard}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableWithoutFeedback key={item.route} onPress={() => handleNavigate(item.route)}>
                <View style={[styles.menuItem, index !== MENU_ITEMS.length - 1 && styles.menuItemBorder]}>
                  <View style={[styles.menuItemIconBg, {backgroundColor: item.buttonColor}]}>
                    <Icon name={item.icon} size={24} color={item.iconColor} />
                  </View>
                  <Text style={styles.menuItemText}>{item.text}</Text>
                  <Icon name="chevron-right" size={20} color="#CBD5E1" />
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>
      </ScrollView>

      {footerVisible && <CollapsedTotal />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  headerContainer: {
    backgroundColor: '#0E1321',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerClock: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconBg: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    width: '48%',
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  menuTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 15,
  },
  menuListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
});
