import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Colors, Helpers, Moment} from '../../../../utils';
import globalStyles from '../../../../utils/Styles';
import {useDispatch, useSelector} from 'react-redux';
import {
  setProximosSorteos,
  setSorteoSeleccionado,
} from '../../../../features/tickets/magico/magicoSlice';

export default function ListaProximosSorteos() {
  const {proximosSorteos} = useSelector(state => state.magico);

  return (
    <>
      <Text style={[globalStyles.sectionTitle, {marginHorizontal: '2.5%'}]}>
        Sorteos
      </Text>
      <View style={styles.listaSorteos}>
        <ScrollView horizontal>
          {proximosSorteos.map(item => (
            <ProximoSorteoItem key={item.id} sorteo={item} />
          ))}
        </ScrollView>
      </View>
    </>
  );
}

function ProximoSorteoItem({sorteo}) {
  const {proximosSorteos} = useSelector(state => state.magico);
  const dispatch = useDispatch();

  const handlePress = () => {
    const _sorteos = proximosSorteos.map(item => ({
      ...item,
      selected: item.id === sorteo.id,
    }));
    dispatch(setProximosSorteos(_sorteos));
    dispatch(setSorteoSeleccionado(sorteo));
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.proximoSorteoItem}>
        {/* SORTEO LOGO */}
        <ProximoSorteoLogo sorteo={sorteo} />
        {/* FECHA SORTEO */}
        <FechaProximoSorteo sorteo={sorteo} />
      </View>
    </TouchableWithoutFeedback>
  );
}

function ProximoSorteoLogo({sorteo}) {
  const logoBoxStyles = sorteo.selected
    ? [styles.proximoSorteoLogoBox, styles.proximoSorteoLogoBoxActive]
    : styles.proximoSorteoLogoBox;
  return (
    <View style={logoBoxStyles}>
      <Image
        resizeMode="contain"
        style={styles.proximoSorteoLogo}
        source={{uri: Helpers.urlImage(sorteo.codigoSorteo)}}
      />
    </View>
  );
}

function FechaProximoSorteo({sorteo}) {
  return (
    <Text
      style={[
        {
          fontWeight: sorteo.selected ? 'bold' : 'normal',
        },
        {
          color: sorteo.selected ? Colors.primary : '#ccc',
        },
      ]}>
      {Moment(sorteo.fecha).format('ddd DD MMM')}
    </Text>
  );
}

const styles = StyleSheet.create({
  listaSorteos: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  proximoSorteoItem: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  proximoSorteoLogoBox: {
    borderRadius: 50,
    borderWidth: 3,
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
    marginRight: 10,
    overflow: 'hidden',
  },
  proximoSorteoLogoBoxActive: {
    borderTopColor: Colors.primary,
    borderBottomColor: Colors.primary,
    borderLeftColor: Colors.primary,
    borderRightColor: Colors.primary,
  },
  proximoSorteoLogo: {
    width: 70,
    height: 70,
  },
});
