import React, {useEffect, useState, useRef} from 'react';
import {Storage} from '../../../../utils';
import {obtenerVouchersApi} from '../../../../services/tickets';
import {View, Animated, Text, StyleSheet} from 'react-native';
import {Colors} from '../../../../utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Comprobantes({refreshTrigger}) {
  const [usuario] = useState(Storage.getUser());
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [loading]);

  useEffect(() => {
    loadComprobantes();
  }, [refreshTrigger]);

  const loadComprobantes = async () => {
    try {
      setLoading(true);
      const data = await obtenerVouchersApi(usuario.usuario);
      setComprobantes(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View>
          {[1, 2, 3].map(i => (
            <Animated.View
              key={i}
              style={[styles.loaderCard, {opacity: pulseAnim}]}>
              <View style={styles.loaderIcon} />
              <View style={{flex: 1}}>
                <View style={styles.loaderTitle} />
                <View style={styles.loaderSubtitle} />
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View>
          {comprobantes.length > 0 ? (
            comprobantes.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={[
                  styles.iconContainer,
                  {backgroundColor: item?.visto ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}
                ]}>
                  <Icon 
                    name={item?.visto ? 'check-circle' : 'clock-outline'} 
                    size={24} 
                    color={item?.visto ? '#10B981' : '#F59E0B'} 
                  />
                </View>
                <View style={styles.contentContainer}>
                  <Text style={styles.title}>
                    {item?.visto ? 'Comprobante Revisado' : 'En Revisión'}
                  </Text>
                  <Text style={styles.description}>
                    Capturada el {item.fecha}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="image-off-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No hay comprobantes registrados</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
  },
  loaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  loaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 16,
  },
  loaderTitle: {
    width: '60%',
    height: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    marginBottom: 8,
  },
  loaderSubtitle: {
    width: '40%',
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 15,
  },
});
