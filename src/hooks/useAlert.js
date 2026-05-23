import React from 'react';
import {Alert} from 'react-native';

export default function useAlert(navigation = null) {
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
      PRINTER_COVER_OPEN: () => {
        Alert.alert(
          'Impresora',
          'La tapa de la impresora está abierta. Ciérrala e intenta de nuevo.',
          [{text: 'Entendido'}],
        );
      },
      PRINTER_PAPER_NEAR_END: () => {
        Alert.alert(
          'Impresora',
          'El papel de la impresora se está terminando o no hay papel. Verifica el rollo e intenta de nuevo.',
          [{text: 'Entendido'}],
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
