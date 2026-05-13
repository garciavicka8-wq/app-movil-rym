import React, {useEffect, useState} from 'react';
import {FlatList, Text, View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {Container} from '../../../components/Layout';
import {Colors, Utils, Storage} from '../../../utils';
import CarrierCard from './components/CarrierCard';
import {Appbar, Searchbar} from 'react-native-paper';
import CustomStatusBar from '../../../components/CustomStatusBar';

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
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <>
        {!buscadorActivo && (
          <Appbar.Header style={styles.appBar}>
            <Appbar.BackAction
              color="white"
              onPress={() => navigation.goBack()}
            />
            <Appbar.Content color="white" titleStyle={styles.appBarTitle} title={selectedCategory.Nombre} />
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
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitleText}>
          Selecciona un proveedor
        </Text>
      </View>
      <FlatList
        keyExtractor={item => item.ID}
        numColumns={2}
        data={filteredCarriers}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitleText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  flatListContent: {
    paddingHorizontal: '2%',
    paddingBottom: 20,
  },
});
