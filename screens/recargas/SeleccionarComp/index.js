import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Container} from '../../../components/Layout';
import {Colors, Utils, Styles as globalStyles} from '../../../utils';
import CarrierCard from './components/CarrierCard';
import {Appbar, Searchbar} from 'react-native-paper';

export default function SeleccionarComp({navigation, route}) {
  const [buscadorActivo, setBuscadorActivo] = useState(false);
  const {selectedCategory, carriers, products} = useSelector(
    state => state.taecel,
  );
  const [filteredCarriers, setFilteredCarriers] = useState([]);
  const {params} = route;

  useEffect(() => {
    navigation.setOptions({title: params.screenTitle});
    const filtered = carriers.filter(
      item => item.CategoriaID == selectedCategory.ID,
    );
    setFilteredCarriers(filtered);
  }, []);

  const handlePress = item => {
    const _products = products.filter(
      p => p.CategoriaID === item.CategoriaID && item.ID === p.CarrierID,
    );
    navigation.navigate('Vender', {
      carrier: item,
      products: _products,
    });
  };

  const handleInputChange = text => {
    const _filtered = Utils.filterByValue(
      carriers.filter(item => item.CategoriaID == selectedCategory.ID),
      text,
    );
    setFilteredCarriers(_filtered);
  };

  const renderItem = ({item, index}) => {
    return (
      <CarrierCard
        text={item.Nombre}
        imageURL={item.Logotipo}
        onPress={() => handlePress(item)}
      />
    );
  };

  const handleToggleAppbar = () => {
    setBuscadorActivo(prevState => !prevState);
  };

  useEffect(() => {
    if (!buscadorActivo) {
      const filtered = carriers.filter(
        item => item.CategoriaID == selectedCategory.ID,
      );
      setFilteredCarriers(filtered);
    }
  }, [buscadorActivo]);

  return (
    <Container>
      <>
        {!buscadorActivo && (
          <Appbar.Header style={{backgroundColor: Colors.blue}}>
            <Appbar.BackAction
              color="white"
              onPress={() => navigation.goBack()}
            />
            <Appbar.Content color="white" title={selectedCategory.Nombre} />
            <Appbar.Action
              color="white"
              icon="magnify"
              onPress={handleToggleAppbar}
            />
          </Appbar.Header>
        )}
        {buscadorActivo && (
          <Searchbar
            autoFocus
            placeholder="Buscar"
            icon="close"
            onIconPress={handleToggleAppbar}
            onChangeText={handleInputChange}
          />
        )}
      </>
      <View style={globalStyles.navSectionTitle}>
        <Text style={globalStyles.navSectionTitleText}>
          Selecciona un proveedor
        </Text>
      </View>
      <FlatList
        keyExtractor={item => item.ID}
        numColumns={2}
        data={filteredCarriers}
        renderItem={renderItem}
      />
    </Container>
  );
}
