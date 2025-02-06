import React, {useState} from 'react';
import {IconButton, Menu} from 'react-native-paper';

export default function PeriodoMenu({cargando, onMenuItemPress}) {
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
          disabled={cargando}
          onPress={() => setVisible(true)}
        />
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
