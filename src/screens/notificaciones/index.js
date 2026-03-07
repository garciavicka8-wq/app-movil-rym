import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import axios from 'axios';
import {RYM_API_URL} from '../../constants';
import {Storage} from '../../utils';
import {useDispatch} from 'react-redux';
import {setUnreadCount} from '../../features/notifications/notificationsSlice';
import moment from 'moment';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

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
      // data.data asume que Laravel usó paginate()
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
      // Poner contador en cero a nivel global inmediatamente
      dispatch(setUnreadCount(0));
    } catch (error) {
      console.log('Error marking read:', error);
    }
  };

  const renderItem = ({item}) => {
    const isUnread = item.read_at === null;
    return (
      <View style={[styles.card, isUnread && styles.cardUnread]}>
        <Text style={styles.title}>{item.data?.title || 'Notificación'}</Text>
        <Text style={styles.message}>{item.data?.message || ''}</Text>
        <Text style={styles.date}>
          {moment(item.created_at).format('DD MMM YYYY, hh:mm A')}
        </Text>
      </View>
    );
  };

  return (
    <>
      <CustomStatusBar />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={notificaciones}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tienes notificaciones recientes.</Text>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: 'red',
    backgroundColor: '#FFF5F5',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});
