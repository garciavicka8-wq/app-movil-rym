import React from 'react';
import {Colors} from '../../../utils';
import CreditCard from '../../../components/CreditCard';
import MainMenuSectionButtons from '../../../components/MainMenuSectionButtons';
import MainMenuIconButton from '../../../components/MainMenuIconButton';
import {useSelector} from 'react-redux';
import {useCustomNavigation} from '../../../hooks';
import {APP_NAVIGATION} from '../../../constants';
import CollapsedTotal from './components/CollapsedTotal';
import {MENU_ITEMS} from './components/constants';

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
        {MENU_ITEMS.map(item => (
          <MainMenuIconButton
            text={item.text}
            buttonColor={item.buttonColor}
            icon={item.icon}
            iconColor={item.iconColor}
            textColor={item.textColor}
            onPress={() => handleNavigate(item.route)}
            fullwidth={item.fullwidth}
          />
        ))}
      </MainMenuSectionButtons>
      {footerVisible && <CollapsedTotal />}
    </>
  );
}
