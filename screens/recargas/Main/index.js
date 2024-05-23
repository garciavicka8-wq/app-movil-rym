import React, {useEffect} from 'react';
import {Alert, ScrollView} from 'react-native';
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

export default function RecargasMenu() {
  const {isAuthenticated} = useAuthContext();
  const {mainProducts, loadingProducts} = useSelector(state => state.taecel);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (isAuthenticated && mainProducts.length === 0) {
      dispatch(setLoadingProducts(true));
      const res = await getProducts();
      const {data, success} = res;
      let _categories = [];
      let _carriers = [];
      let _products = [];
      if (success) {
        _categories = [...data.categorias];
        _carriers = [...data.carriers];
        _products = [...data.productos];
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
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  return (
    <>
      <CreditCard
        backDropColor={Colors.blue}
        cardColor={Colors.darkBlue}
        iconBgColor={Colors.blue}
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
      {!loadingProducts && (
        <ScrollView>
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
        </ScrollView>
      )}
    </>
  );
}
