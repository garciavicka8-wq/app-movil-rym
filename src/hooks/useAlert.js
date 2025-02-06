import React from 'react';
import {Alert} from 'react-native';

export function useAlert(navigation = null) {
  const show = (errorType, callback = undefined) => {
    const ACTIONS = {
      PRINTER_NOT_REGISTERED: () => {
        Alert.alert(
          'Mensaje',
          'Registra una impresora para poder utilizar esta funcion',
          [
            {text: 'Ahora no'},
            {
              text: 'Registrar impresora',
              onPress: () => {
                if (callback != undefined) {
                  callback();
                }
              },
            },
          ],
        );
      },
      BLUETOOTH_NOT_ENABLED: () => {
        Alert.alert(
          'Mensaje',
          'Activa el bluetooth para poder usar esta funcion',
          [
            {text: 'Ahora no'},
            {
              text: 'Activar',
              onPress: () => {
                if (callback != undefined) {
                  callback();
                }
              },
            },
          ],
        );
      },
    };
    if (ACTIONS[errorType]) {
      ACTIONS[errorType]();
    }
  };

  return {
    show,
  };
}
