import React, {useEffect, useState, useLayoutEffect} from 'react';
import {Alert, ScrollView, View, Text, StyleSheet} from 'react-native';
import {IconButton} from 'react-native-paper';
import {Colors, Storage} from '../../../utils';
import {
  APP_NAVIGATION,
  CATEGORIAS_ICONS,
  CATEGORIAS_ICON_COLORS,
} from '../../../constants';
import {useDispatch, useSelector} from 'react-redux';
import CreditCard from '../../../components/CreditCard';
import MainMenuIconButton from '../../../components/MainMenuIconButton';
import MainMenuSectionButtons from '../../../components/MainMenuSectionButtons';
import {
  setCarriers,
  setCategoriaSeleccionada,
  setLoadingProducts,
  setMainProducts,
  setProducts,
  setSelectedCategory,
} from '../../../features/taecel/taecelSlice';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnection from '../../../components/NoConnection';
import UltimosMovimientos from '../UltimosMovimientos';
import {useNavigation} from '@react-navigation/native';
import {useAuthContext} from '../../../context/AuthContext';
import {getProducts} from '../../../services/taecel';
import {Button} from 'react-native-paper';
import CustomStatusBar from '../../../components/CustomStatusBar';
import ServerClock from '../../../components/ServerClock';

export default function RecargasMenu() {
  const {isAuthenticated} = useAuthContext();
  const {mainProducts, loadingProducts} = useSelector(state => state.taecel);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const netInfo = useNetInfo();
  const [userName, setUserName] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loginData = Storage.getItem('loginData', true);
    if (loginData !== null) {
      setUserName(loginData.userName);
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      if (isAuthenticated && mainProducts.length === 0) {
        dispatch(setLoadingProducts(true));
        const rymResponse = await getProducts();
        let _categories = [];
        let _carriers = [];
        let _products = [];
        if (rymResponse.success) {
          _categories = [...rymResponse.data.categorias];
          _carriers = [...rymResponse.data.carriers];
          _products = [...rymResponse.data.productos];
        } else {
          Alert.alert('Error', rymResponse.error_message || 'Error al obtener productos');
        }
        let _mainProducts = [];
        _categories.forEach((item, index) => {
          _mainProducts[index] = {
            id: index,
            text: item.Nombre,
            empty: false,
            categoria: item,
          };
        });
        
        dispatch(setMainProducts(_mainProducts));
        dispatch(setCarriers(_carriers));
        dispatch(setProducts(_products));
        dispatch(setLoadingProducts(false));
      }
    } catch (error) {
      console.log(error.message);
      dispatch(setMainProducts([]));
      dispatch(setCarriers([]));
      dispatch(setProducts([]));
    } finally {
      dispatch(setLoadingProducts(false));
    }
  };

  const handleNavigate = categoria => {
    // VERIFICAR CODIGO PIN
    const codigoPinStorage = Storage.getItem('codigoPin');
    // SET LOGIN TIME TO TRACK INACTIVITTY TIME
    // await Utils.setLoginTime();
    // SI NO EXISTE
    if (codigoPinStorage === null) {
      Alert.alert(
        'Mensaje',
        'No cuentas con un código PIN, por favor ve a Configuracion/Codigo PIN y crea uno',
        [
          {text: 'cancelar'},
          {
            text: 'Ir a Código PIN',
            onPress: () =>
              navigation.navigate(APP_NAVIGATION.SCREENS.CODIGO_PIN),
          },
        ],
      );
      return;
    }
    dispatch(setCategoriaSeleccionada(categoria));
    dispatch(setSelectedCategory(categoria));
    navigation.navigate('SeleccionarComp', {
      screenTitle: categoria.Nombre,
    });
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  return (
    <>
      <CustomStatusBar color="darkBackground" />
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>{userName ? userName.toUpperCase() : 'USUARIO'}</Text>
            <ServerClock style={styles.headerClock} />
          </View>
        <View style={styles.headerIcons}>
          <IconButton 
            icon="bell" 
            iconColor="#FBBF24" 
            size={24} 
            style={styles.headerIconBg} 
            onPress={() => navigation.navigate(APP_NAVIGATION.SCREENS.NOTIFICACIONES)}
          />
          <IconButton 
            icon="cog" 
            iconColor={Colors.white} 
            size={24} 
            style={styles.headerIconBg} 
            onPress={() => navigation.navigate(APP_NAVIGATION.SCREENS.CONFIG_MENU)}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CreditCard
          backDropColor="transparent"
          cardColor={Colors.primary}
          iconBgColor="rgba(255,255,255,0.2)"
        />
      {loadingProducts && (
        <>
          <MainMenuSectionButtons title="Opciones" titleColor={Colors.darkBlue}>
            <MainMenuIconButton progress />
            <MainMenuIconButton progress />
            <MainMenuIconButton progress />
            <MainMenuIconButton progress />
            <MainMenuIconButton progress />
            <MainMenuIconButton empty />
          </MainMenuSectionButtons>
        </>
      )}
      {!loadingProducts && mainProducts.length == 0 && (
        <Button icon={'reload'} onPress={() => loadProducts()}>
          Recargar productos
        </Button>
      )}
      {!loadingProducts && mainProducts.length > 0 && (
        <View>
          <UltimosMovimientos />
          <MainMenuSectionButtons title="Opciones" titleColor={Colors.darkBlue}>
            {mainProducts.map(item => (
              <MainMenuIconButton
                key={item.id}
                text={item.text}
                buttonColor={Colors.lightBlue}
                icon={CATEGORIAS_ICONS[item.categoria.ID]}
                iconColor={CATEGORIAS_ICON_COLORS[item.categoria.ID]}
                textColor={Colors.darkBlue}
                empty={false}
                onPress={() => handleNavigate(item.categoria)}
              />
            ))}
            {mainProducts.length > 0 && (
              <>
                <MainMenuIconButton
                  text="Registros"
                  buttonColor={Colors.lightBlue}
                  icon="clipboard-list"
                  iconColor={Colors.darkBlue}
                  textColor={Colors.darkBlue}
                  onPress={() => navigation.navigate('Transacciones')}
                />
                <MainMenuIconButton empty />
              </>
            )}
          </MainMenuSectionButtons>
        </View>
      )}
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  headerContainer: {
    backgroundColor: '#0E1321',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerClock: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconBg: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
