import React from 'react';
import {Button, Snackbar} from 'react-native-paper';

export default function NoConnectionSnackbar({open = false, onDismiss}) {
  return (
    <Snackbar
      style={{backgroundColor: 'red'}}
      visible={open}
      duration={10000}
      onDismiss={onDismiss}>
      <Button textColor="#fff" mode="text" icon="wifi-off">
        Te quedaste sin internet
      </Button>
    </Snackbar>
  );
}
