import React from 'react';
import {Colors} from '../../../utils';
import CreditCard from '../../../components/CreditCard';
import MainMenuSectionButtons from '../../../components/MainMenuSectionButtons';
import MainMenuIconButton from '../../../components/MainMenuIconButton';
import {useSelector} from 'react-redux';
import {useCustomNavigation} from '../../../hooks';
import {APP_NAVIGATION} from '../../../constants';
import CollapsedTotal from './components/CollapsedTotal';

export default function Main() {
  const {registrosAlMomento} = useSelector(state => state.cliente);
  const navigation = useCustomNavigation();

  const handleNavigate = routeName => {
    navigation.navigate(APP_NAVIGATION.SCREENS[routeName]);
  };

  const footerVisible = registrosAlMomento.length > 0;

  return (
    <>
      <CreditCard
        backDropColor={Colors.primary}
        cardColor={Colors.lightBrown}
        iconBgColor={Colors.brown}
      />
      <MainMenuSectionButtons title="TICKET PLUS" titleColor={Colors.primary}>
        <MainMenuIconButton
          text="Registrar"
          buttonColor={Colors.lightRed}
          icon="receipt"
          iconColor={Colors.dark}
          textColor={Colors.primary}
          onPress={() => handleNavigate('JUGAR_TICKETS')}
          fullwidth
        />
        {/* <MainMenuIconButton
          text="Mágico"
          buttonColor={Colors.lightRed}
          icon="auto-fix"
          iconColor={Colors.dark}
          textColor={Colors.primary}
          onPress={() => handleNavigate('MAGICO')}
        /> */}
        <MainMenuIconButton
          text="Pagos"
          buttonColor={Colors.lightRed}
          icon="account-cash"
          iconColor={Colors.green}
          textColor={Colors.primary}
          onPress={() => handleNavigate('PAGOS')}
        />
        <MainMenuIconButton
          text="Cancelados"
          buttonColor={Colors.lightRed}
          icon="file-cancel"
          iconColor={Colors.primary}
          textColor={Colors.primary}
          onPress={() => handleNavigate('CANCELAR')}
        />
        {/* <MainMenuIconButton empty /> */}
      </MainMenuSectionButtons>
      {footerVisible && <CollapsedTotal />}
    </>
  );
}
