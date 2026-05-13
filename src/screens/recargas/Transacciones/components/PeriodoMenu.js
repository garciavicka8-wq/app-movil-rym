import React, {useState, cloneElement} from 'react';
import {IconButton, Menu} from 'react-native-paper';

export default function PeriodoMenu({cargando, onMenuItemPress, trigger}) {
  const [visible, setVisible] = useState(false);

  const handleItemPress = value => {
    onMenuItemPress(value);
    setVisible(false);
  };

  const openMenu = () => setVisible(true);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        trigger ? (
          cloneElement(trigger, {
            onPress: openMenu,
            disabled: cargando,
          })
        ) : (
          <IconButton
            icon={!visible ? 'chevron-down' : 'chevron-up'}
            disabled={cargando}
            onPress={openMenu}
          />
        )
      }>
      <Menu.Item title="Semana En Curso" onPress={() => handleItemPress(0)} />
      <Menu.Item title="Semana pasada" onPress={() => handleItemPress(1)} />
      <Menu.Item title="Semana antepasada" onPress={() => handleItemPress(2)} />
      <Menu.Item
        title="Tres semanas atras"
        onPress={() => handleItemPress(3)}
      />
    </Menu>
  );
}
