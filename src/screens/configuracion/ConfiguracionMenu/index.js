import React, {useLayoutEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import {Container, Content} from '../../../components/Layout';
import MenuOpciones from './components/MenuOpciones';
import PerfilHeader from './components/PerfilHeader';
import Version from './components/Version';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Colors} from '../../../utils';
import {useCustomNavigation} from '../../../hooks';

export default function ConfiguracionMenu({navigation}) {
  const {isFocused} = useCustomNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Configuración" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content marginBottom={40}>
          <PerfilHeader />
          <View style={styles.spacer} />
          <MenuOpciones />
          <Version />
        </Content>
      </Container>
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
  spacer: {
    height: 25,
  },
});
