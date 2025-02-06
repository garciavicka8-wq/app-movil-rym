import React, {useEffect, useState} from 'react';
import {List, Switch} from 'react-native-paper';
import {ReactNativeBiometricsLegacy} from 'react-native-biometrics';
import {Colors, Storage} from '../../../utils';
import {StatusBar} from 'react-native';
import {useCustomNavigation} from '../../../hooks';

export default function Seguridad() {
  const {isFocused} = useCustomNavigation();
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);

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
      throw new Error(message);
    }
  };

  const onToggleSwitch = () => {
    setIsSwitchOn(!isSwitchOn);
    // IF SWITCH IS ON CREATE KEYS
    if (!isSwitchOn) {
      Storage.setItem('fingerPrintLogin', 'active');
      // console.log('fingerPrintLogin active');
    }
    // IF SWITCH IS OFF DELETE KEYS IF CREATED
    if (isSwitchOn) {
      Storage.removeItem('fingerPrintLogin');
      // console.log('fingerPrintLogin unactive');
    }
  };
  return (
    <>
      {isFocused && <StatusBar backgroundColor={Colors.dark} />}
      <List.Item
        title="Huella Digital"
        description="activa el acceso a la aplicación por medio de la huella digital"
        right={props => (
          <Switch
            {...props}
            disabled={!isSensorAvailable}
            value={isSwitchOn}
            onValueChange={onToggleSwitch}
            color={Colors.blue}
          />
        )}
      />
    </>
  );
}
