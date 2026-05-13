import React, {useEffect, useState, useLayoutEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {List, Switch, Appbar} from 'react-native-paper';
import {ReactNativeBiometricsLegacy} from 'react-native-biometrics';
import {Colors, Storage} from '../../../utils';
import {useCustomNavigation} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Container, Content} from '../../../components/Layout';

export default function Seguridad({navigation}) {
  const {isFocused} = useCustomNavigation();
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    verifySensorAvailability();
  }, []);

  const verifySensorAvailability = async () => {
    try {
      const fingerPrintLogin = Storage.getItem('fingerPrintLogin');
      const {available, biometryType} =
        await ReactNativeBiometricsLegacy.isSensorAvailable();
      setIsSensorAvailable(
        available &&
          biometryType !== undefined &&
          biometryType === 'Biometrics',
      );
      setIsSwitchOn(
        available &&
          biometryType !== undefined &&
          biometryType === 'Biometrics' &&
          fingerPrintLogin !== null,
      );
    } catch ({message}) {
      console.log('Error verifying sensor:', message);
    }
  };

  const onToggleSwitch = () => {
    setIsSwitchOn(!isSwitchOn);
    if (!isSwitchOn) {
      Storage.setItem('fingerPrintLogin', 'active');
    }
    if (isSwitchOn) {
      Storage.removeItem('fingerPrintLogin');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Seguridad" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content>
          <View style={styles.card}>
            <List.Item
              title="Huella Digital"
              titleStyle={styles.itemTitle}
              description="Activa el acceso a la aplicación por medio de biometría."
              descriptionStyle={styles.itemDescription}
              left={props => <List.Icon {...props} icon="fingerprint" color={isSwitchOn ? "#3B82F6" : "#64748B"} />}
              right={props => (
                <Switch
                  {...props}
                  disabled={!isSensorAvailable}
                  value={isSwitchOn}
                  onValueChange={onToggleSwitch}
                  color="#3B82F6"
                />
              )}
              style={styles.listItem}
            />
          </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 10,
  },
  listItem: {
    borderRadius: 16,
  },
  itemTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemDescription: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 2,
  },
});
