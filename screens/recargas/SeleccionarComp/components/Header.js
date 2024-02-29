import React, {useState} from 'react';
import {Appbar, Searchbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setQueryCarrierResults} from '../../../../features/taecel/taecelSlice';
import {useCustomNavigation} from '../../../../hooks';
import {Colors} from '../../../../utils';

export default function Header() {
  const [buscadorActivo, setBuscadorActivo] = useState(false);
  const {categoriaSeleccionada, carriersFiltradas} = useSelector(
    state => state.taecel,
  );
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  const handleToggleAppbar = () => {
    setBuscadorActivo(prevState => !prevState);
    dispatch(setQueryCarrierResults(carriersFiltradas));
  };

  const buscarCarrier = value => {
    const queryResults = [...carriersFiltradas].filter(el =>
      el.Nombre.toLowerCase().match(value.toLowerCase()),
    );
    dispatch(setQueryCarrierResults(queryResults));
  };

  return (
    <>
      {!buscadorActivo && (
        <Appbar.Header style={{backgroundColor: Colors.blue}}>
          <Appbar.BackAction
            color="white"
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content color="white" title={categoriaSeleccionada.Nombre} />
          <Appbar.Action
            color="white"
            icon="magnify"
            onPress={handleToggleAppbar}
          />
        </Appbar.Header>
      )}
      {buscadorActivo && (
        <Searchbar
          placeholder="Buscar"
          icon="close"
          onIconPress={handleToggleAppbar}
          onChangeText={buscarCarrier}
        />
      )}
    </>
  );
}
