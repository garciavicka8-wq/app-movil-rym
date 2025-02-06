import React, {useState} from 'react';
import {Alert, View} from 'react-native';
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
        // SI SE CONECTO A IMPRESORA CORRECTAMENTE
        if (isPrintingPossible && publicacion) {
          // IMPRIMIR NUMEROS
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
      <View style={{width: '100%'}}>
        <List.Item
          title="cargando sorteos"
          description="..."
          left={props => (
            <List.Icon {...props} icon="dots-vertical" color={Colors.dark} />
          )}
          // right={props => (
          //   <List.Icon {...props} icon="printer" color={Colors.dark} />
          // )}
        />
      </View>
    );
  }

  return (
    <View style={{width: '100%'}}>
      <List.Item
        title={sorteoSelected ? sorteoSelected.sorteo : 'No hay sorteo'}
        description={
          sorteoSelected
            ? Moment(sorteoSelected.fecha).format('dddd DD MMM YY')
            : ''
        }
        left={props => (
          <MenuDesplegable
            onMenuItemPress={fechaSorteo => cargarGanadores(fechaSorteo)}
          />
        )}
        // right={() => (
        //   <IconButton
        //     icon="printer"
        //     color={Colors.dark}
        //     onPress={handleImprimir}
        //   />
        // )}
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
      anchor={
        <IconButton
          icon={!visible ? 'chevron-down' : 'chevron-up'}
          color={Colors.dark}
          onPress={() => setVisible(true)}
        />
      }>
      <>
        {sorteosJugados.map(item => (
          <Menu.Item
            key={item.id}
            title={Moment(item.fecha).format('dddd DD MMM YY')}
            onPress={() => handleItemPress(item.fecha)}
          />
        ))}
      </>
    </Menu>
  );
};
