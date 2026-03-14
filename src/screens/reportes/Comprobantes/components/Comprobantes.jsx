import React, {useEffect, useState, useRef} from 'react';
import ReportarDepositoButton from './ReportarDepositoButton';
import {Storage} from '../../../../utils';
import {obtenerVouchersApi} from '../../../../services/tickets';
import {List} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {Colors} from '../../../../utils';

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
    <>
      {/* COMPROBANTES */}
      {loading ? (
        <View style={{marginTop: 20}}>
          {[1, 2, 3].map(i => (
            <Animated.View
              key={i}
              style={{
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
                opacity: pulseAnim,
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E1E9EE',
                  marginRight: 16,
                }}
              />
              <View style={{flex: 1}}>
                <View
                  style={{
                    width: '60%',
                    height: 12,
                    backgroundColor: '#E1E9EE',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    width: '40%',
                    height: 10,
                    backgroundColor: '#E1E9EE',
                    borderRadius: 4,
                  }}
                />
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <>
          {comprobantes.length > 0 &&
            comprobantes.map((item, index) => (
              <List.Item
                key={index}
                title={item?.visto ? 'Revisada' : 'En revisión'}
                description={`Capturada el ${item.fecha}`}
                left={props => <List.Icon {...props} icon="image" />}
              />
            ))}
        </>
      )}
    </>
  );
}
