import React, {useEffect, useRef} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setSorteoSeleccionado} from '../../../../features/tickets/jugarTickets/jugarTicketsSlice';
import {useSorteos} from '../../../../hooks';
import {Moment, Helpers} from '../../../../utils';

export default function ListaSorteosPendientes() {
  const {cargando, cargarProximosSorteos} = useSorteos();

  useEffect(() => {
    cargarProximosSorteos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Sorteos</Text>
      {cargando && <SorteosLoading />}
      {!cargando && <Sorteos />}
    </View>
  );
}

const SorteosLoading = () => {
  return (
    <View style={styles.listaSorteos}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.pillLoading} />
      ))}
    </View>
  );
};

const Sorteos = () => {
  const {proximosSorteos, jugadas, sorteoSeleccionado} = useSelector(
    state => state.jugarTickets,
  );
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const isInitialMount = useRef(true);

  // Efecto para scroll inicial o cambios externos
  useEffect(() => {
    if (sorteoSeleccionado && proximosSorteos.length > 0) {
      if (isInitialMount.current) {
        scrollToIndex(proximosSorteos.findIndex(s => s.id === sorteoSeleccionado.id), true);
        isInitialMount.current = false;
      }
    }
  }, [proximosSorteos]);

  const scrollToIndex = (index, animated = true) => {
    if (index === -1) return;
    // Cálculo más preciso: ancho aproximado de píldora (125) + margen (12)
    const itemWidth = 137; 
    const offset = index * itemWidth;
    
    // Pequeño retardo para asegurar que el ScrollView esté listo
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: offset,
        animated,
      });
    }, 100);
  };

  const handlePress = (item, index) => {
    if (sorteoSeleccionado && sorteoSeleccionado.id === item.id) {
      return;
    }
    
    const changeSorteo = () => {
      dispatch(setSorteoSeleccionado(item));
      scrollToIndex(index);
    };

    if (sorteoSeleccionado && jugadas.length > 0) {
      Alert.alert('¿Cambiar de sorteo?', 'Las jugadas ingresadas se perderán', [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Sí, cambiar',
          onPress: changeSorteo,
        },
      ]);
      return;
    }
    
    changeSorteo();
  };

  if (!sorteoSeleccionado) {
    return <Text style={styles.noSorteosText}>No hay sorteos disponibles</Text>;
  }

  return (
    <View style={styles.listaSorteos}>
      <ScrollView 
        ref={scrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={137} // Ayuda a que se detenga en elementos
        decelerationRate="fast"
      >
        {proximosSorteos.map((s, index) => {
          const isSelected = sorteoSeleccionado?.id === s.id;
          return (
            <TouchableOpacity 
              key={s.id} 
              activeOpacity={0.8}
              onPress={() => handlePress(s, index)}
              style={[
                styles.sorteoPill,
                isSelected && styles.sorteoPillActive
              ]}
            >
              <View style={styles.logoContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.logo}
                  source={{uri: Helpers.urlImage(s.codigoSorteo)}}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.fechaText,
                  isSelected && styles.fechaTextActive
                ]}>
                  {Moment(s.fecha).format('ddd DD')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    backgroundColor: '#F8FAFC',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748B',
    marginLeft: 15,
    marginBottom: 12,
  },
  listaSorteos: {
    flexDirection: 'row',
    paddingBottom: 15,
  },
  scrollContent: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  pillLoading: {
    width: 140,
    height: 54,
    backgroundColor: '#E2E8F0',
    borderRadius: 27,
    marginRight: 12,
  },
  sorteoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: 125, // Ancho fijo para cálculos precisos
  },
  sorteoPillActive: {
    backgroundColor: '#0E1321',
    borderColor: '#0E1321',
    elevation: 4,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 32,
    height: 32,
  },
  textContainer: {
    marginLeft: 12,
  },
  fechaText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
    textTransform: 'capitalize',
  },
  fechaTextActive: {
    color: '#FFFFFF',
  },
  horaText: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  horaTextActive: {
    color: '#94A3B8',
  },
  noSorteosText: {
    fontFamily: 'Inter',
    marginLeft: 15,
    color: '#64748B',
    fontSize: 14,
  }
});
