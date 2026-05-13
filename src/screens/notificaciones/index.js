import React, {useEffect, useState, useLayoutEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import {RYM_API_URL} from '../../constants';
import {Storage, Colors} from '../../utils';
import {useDispatch} from 'react-redux';
import {setUnreadCount} from '../../features/notifications/notificationsSlice';
import moment from 'moment';
import CustomStatusBar from '../../components/CustomStatusBar';
import {Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function Notificaciones({navigation}) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchNotificaciones();
    marcarComoLeidas();
  }, []);

  const getHeaders = () => {
    const user = Storage.getUser();
    return {
      Authorization: `Bearer ${user?.token}`,
      Accept: 'application/json',
    };
  };

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      const {data} = await axios.get(`${RYM_API_URL}/notifications`, {
        headers: getHeaders(),
      });
      setNotificaciones(data.data || data);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeidas = async () => {
    try {
      await axios.post(`${RYM_API_URL}/notifications/mark-read`, {}, {
        headers: getHeaders(),
      });
      dispatch(setUnreadCount(0));
    } catch (error) {
      console.log('Error marking read:', error);
    }
  };

  const renderItem = ({item}) => {
    const isUnread = item.read_at === null;
    return (
      <TouchableOpacity activeOpacity={0.7} style={[styles.card, isUnread && styles.cardUnread]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, isUnread && styles.iconContainerUnread]}>
            <Icon 
              name={isUnread ? "bell-ring" : "bell-outline"} 
              size={20} 
              color={isUnread ? "#3B82F6" : "#64748B"} 
            />
          </View>
          <Text style={styles.date}>
            {moment(item.created_at).fromNow()}
          </Text>
        </View>
        <Text style={styles.title}>{item.data?.title || 'Notificación'}</Text>
        <Text style={styles.message}>{item.data?.message || ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Notificaciones" 
        />
      </Appbar.Header>

      <View style={styles.container}>
        {loading ? (
          <LoadingIndicator message="Buscando avisos..." />
        ) : (
          <FlatList
            data={notificaciones}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="bell-off-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>No tienes notificaciones recientes.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  container: {
    flex: 1,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardUnread: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerUnread: {
    backgroundColor: '#DBEAFE',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  message: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  date: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: 'Inter',
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
});
