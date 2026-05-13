import React, {useState} from 'react';
import {Alert, View, StyleSheet, Text} from 'react-native';
import {IconButton, List, Menu} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setSorteoSelected} from '../../../../features/tickets/ganadores/ganadoresSlice';
import {useGanadores, useThermalPrinter} from '../../../../hooks';
import {Colors, Moment, Print} from '../../../../utils';

export default function SelectSorteo() {
  const {cargandoSorteosJugados, sorteosJugados, sorteoSelected, publicacion} =
    useSelector(state => state.ganadores);
  const ganadoresHook = useGanadores();
  const dispatch = useDispatch();
  
  const cargarGanadores = async fechaSorteo => {
    await ganadoresHook.obtenerPublicacion(fechaSorteo);
    const _sorteoSelected = sorteosJugados.find(s =>
      Moment(s.fecha).isSame(fechaSorteo),
    );
    dispatch(setSorteoSelected(_sorteoSelected));
  };
  
  const thermalPrinter = useThermalPrinter();

  const handleImprimir = async () => {
    try {
      if (!thermalPrinter.isPrinting) {
        const isPrintingPossible = await thermalPrinter.isPrintingPossible();
        if (isPrintingPossible && publicacion) {
          await thermalPrinter.print(
            Print.winningNumbers(publicacion.fechaSorteo, publicacion.numeros),
          );
        }
      }
    } catch ({message}) {
      Alert.alert('Mensaje', message);
    }
  };

  if (cargandoSorteosJugados || !publicacion) {
    return (
      <View style={styles.container}>
        <List.Item
          title="Cargando sorteos..."
          titleStyle={styles.loadingTitle}
          left={props => <List.Icon {...props} icon="refresh" color="#94A3B8" />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <List.Item
        title={sorteoSelected ? sorteoSelected.sorteo : 'No hay sorteo'}
        titleStyle={styles.title}
        description={
          sorteoSelected
            ? Moment(sorteoSelected.fecha).format('dddd, DD [de] MMMM')
            : ''
        }
        descriptionStyle={styles.description}
        left={props => (
          <MenuDesplegable
            onMenuItemPress={fechaSorteo => cargarGanadores(fechaSorteo)}
          />
        )}
      />
    </View>
  );
}

const MenuDesplegable = ({onMenuItemPress}) => {
  const {sorteosJugados} = useSelector(state => state.ganadores);
  const [visible, setVisible] = useState(false);

  const handleItemPress = value => {
    onMenuItemPress(value);
    setVisible(false);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      contentStyle={styles.menuContent}
      anchor={
        <IconButton
          icon="calendar-search"
          iconColor="#0E1321"
          containerStyle={styles.menuAnchor}
          onPress={() => setVisible(true)}
        />
      }>
      {sorteosJugados.map(item => (
        <Menu.Item
          key={item.id}
          title={Moment(item.fecha).format('DD MMM YY')}
          titleStyle={styles.menuItemTitle}
          onPress={() => handleItemPress(item.fecha)}
        />
      ))}
    </Menu>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0E1321',
    textTransform: 'capitalize',
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  loadingTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
  },
  menuAnchor: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 40,
  },
  menuItemTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#1E293B',
  },
});
