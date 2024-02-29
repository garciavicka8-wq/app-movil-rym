import React, {useEffect} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setSorteoSeleccionado} from '../../../../features/tickets/jugarTickets/jugarTicketsSlice';
import {useSorteos} from '../../../../hooks';
import {Moment, Colors, Helpers} from '../../../../utils';
import globalStyles from '../../../../utils/Styles';

export default function ListaSorteosPendientes() {
  const {cargando, cargarProximosSorteos} = useSorteos();

  useEffect(() => {
    cargarProximosSorteos();
  }, []);

  return (
    <>
      <Text style={[globalStyles.sectionTitle, {marginHorizontal: '2.5%'}]}>
        Sorteos
      </Text>
      {cargando && <SorteosLoading />}
      {!cargando && <Sorteos />}
    </>
  );
}

const SorteosLoading = () => {
  return (
    <>
      <View style={styles.listaSorteos}>
        <View style={styles.sorteoItemLoading}></View>
        <View style={styles.sorteoItemLoading}></View>
        <View style={styles.sorteoItemLoading}></View>
      </View>
    </>
  );
};

const Sorteos = () => {
  const {proximosSorteos, jugadas, sorteoSeleccionado} = useSelector(
    state => state.jugarTickets,
  );
  const dispatch = useDispatch();

  const handlePress = item => {
    if (sorteoSeleccionado && sorteoSeleccionado.id === item.id) {
      return;
    }
    if (sorteoSeleccionado && jugadas.length > 0) {
      Alert.alert('Cambiar de sorteo ?', 'Las jugadas ingresadas se perderán', [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Si, cambiar',
          onPress: () => {
            dispatch(setSorteoSeleccionado(item));
          },
        },
      ]);
      return;
    }
    dispatch(setSorteoSeleccionado(item));
  };

  if (!sorteoSeleccionado) {
    return <Text style={{marginLeft: 15}}>No hay sorteos</Text>;
  }

  return (
    <View style={styles.listaSorteos}>
      <ScrollView horizontal>
        {proximosSorteos.map(s => {
          const logoBoxStyles = s.selected
            ? [styles.logoBox, styles.logoBoxActive]
            : styles.logoBox;
          return (
            <TouchableWithoutFeedback key={s.id} onPress={() => handlePress(s)}>
              <View style={styles.sorteoItem}>
                <View style={logoBoxStyles}>
                  <Image
                    resizeMode="contain"
                    style={styles.logo}
                    source={{uri: Helpers.urlImage(s.codigoSorteo)}}
                  />
                </View>
                <Text
                  style={[
                    {
                      fontWeight: s.selected ? 'bold' : 'normal',
                    },
                    {
                      color: s.selected ? Colors.primary : '#ccc',
                    },
                  ]}>
                  {Moment(s.fecha).format('ddd DD MMM')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  listaSorteos: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  sorteoItemLoading: {
    width: 70,
    height: 70,
    backgroundColor: '#eee',
    borderRadius: 50,
    marginRight: 10,
  },
  sorteoItem: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  logoBox: {
    borderRadius: 50,
    borderWidth: 3,
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
    marginRight: 10,
    overflow: 'hidden',
  },
  logoBoxActive: {
    borderTopColor: Colors.primary,
    borderBottomColor: Colors.primary,
    borderLeftColor: Colors.primary,
    borderRightColor: Colors.primary,
  },
  logo: {
    width: 70,
    height: 70,
  },
});
