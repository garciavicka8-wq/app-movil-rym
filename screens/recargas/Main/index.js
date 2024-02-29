import React, {useEffect, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {Colors, Storage, Utils, uuid} from '../../../utils';
import {useCustomNavigation} from '../../../hooks';
import {
  APP_NAVIGATION,
  CATEGORIAS_ICONS,
  CATEGORIAS_ICON_COLORS,
} from '../../../constants';
import {useDispatch} from 'react-redux';
import CreditCard from '../../../components/CreditCard';
import MainMenuIconButton from '../../../components/MainMenuIconButton';
import MainMenuSectionButtons from '../../../components/MainMenuSectionButtons';
import {getProducts} from '../../../services/taecel';
import {
  setCarriers,
  setCategoriaSeleccionada,
  setCategorias,
  setProductos,
} from '../../../features/taecel/taecelSlice';
import {useNetInfo} from '@react-native-community/netinfo';
import NoConnection from '../../../components/NoConnection';
import UltimosMovimientos from '../UltimosMovimientos';

export default function RecargasMenu() {
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [buttons, setButtons] = useState([]);
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

  useEffect(() => {
    verificarUsuarioRegistrado();
  }, [netInfo?.isConnected]);

  const verificarUsuarioRegistrado = () => {
    const hasSessionExpired = Utils.hasSessionExpired();
    const _usuario = Storage.getItem('usuario', true);
    if (
      _usuario &&
      !hasSessionExpired &&
      netInfo?.isConnected &&
      cargandoProductos
    ) {
      cargarProductos();
    }
  };

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const categoriasStorage = Storage.getItem('categorias', true);
      const carriersStorage = Storage.getItem('carriers', true);
      const productosStorage = Storage.getItem('productos', true);
      let _categorias = [];
      let _carriers = [];
      let _productos = [];
      if (
        categoriasStorage !== null &&
        carriersStorage !== null &&
        productosStorage !== null
      ) {
        _categorias = [...categoriasStorage];
        _carriers = [...carriersStorage];
        _productos = [...productosStorage];
      } else {
        const res = await getProducts();
        const {data, success} = res.data;
        if (success) {
          _categorias = [...data.categorias];
          _carriers = [...data.carriers];
          _productos = [...data.productos];
          Storage.setItem('categorias', JSON.stringify(_categorias));
          Storage.setItem('carriers', JSON.stringify(_carriers));
          Storage.setItem('productos', JSON.stringify(_productos));
        }
      }
      // SI SE CARGARON BIEN LOS PRODUCTOS
      let _buttons = [];
      _categorias.forEach(categoria => {
        _buttons.push({
          id: uuid(),
          icon: CATEGORIAS_ICONS[categoria.ID],
          iconColor: CATEGORIAS_ICON_COLORS[categoria.ID],
          text: categoria.Nombre,
          empty: false,
          categoria,
        });
      });
      setButtons(_buttons);
      dispatch(setCategorias(_categorias));
      dispatch(setCarriers(_carriers));
      dispatch(setProductos(_productos));
      setCargandoProductos(false);
    } catch ({message}) {
      Alert.alert('Mensaje', message);
      setCargandoProductos(false);
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
    navigation.navigate('SeleccionarComp');
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  return (
    <>
      <CreditCard
        backDropColor={Colors.blue}
        cardColor={Colors.darkBlue}
        iconBgColor={Colors.blue}
      />
      {cargandoProductos && (
        <MainMenuSectionButtons title="Opciones" titleColor={Colors.darkBlue}>
          <MainMenuIconButton progress />
          <MainMenuIconButton progress />
          <MainMenuIconButton progress />
          <MainMenuIconButton progress />
          <MainMenuIconButton progress />
          <MainMenuIconButton empty />
        </MainMenuSectionButtons>
      )}
      {!cargandoProductos && (
        <ScrollView>
          <UltimosMovimientos />
          <MainMenuSectionButtons title="Opciones" titleColor={Colors.darkBlue}>
            {buttons.map(item => (
              <MainMenuIconButton
                key={item.id}
                text={item.text}
                buttonColor={Colors.lightBlue}
                icon={item.icon}
                iconColor={item.iconColor}
                textColor={Colors.darkBlue}
                empty={item.empty}
                onPress={() => handleNavigate(item.categoria)}
              />
            ))}
            {buttons.length > 0 && (
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
