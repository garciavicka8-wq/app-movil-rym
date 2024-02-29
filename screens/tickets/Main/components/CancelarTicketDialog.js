import React, {useState} from 'react';
import {Text} from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  RadioButton,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import {Colors, uuid} from '../../../../utils';
import {cancelTicket} from '../../../../services/tickets';
import {useDispatch} from 'react-redux';
import {agregarRegistroAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {establecerCredito} from '../../../../features/credito/creditoSlice';

export default function CancelarTicketDialog({numeroBoleto, via, closeDialog}) {
  const [openDialog, setOpenDialog] = useState(true);
  const [optionSelected, setOptionSelected] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [motivoOtro, setMotivoOtro] = useState(false);
  const [otroContenido, setOtroContenido] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarBgcolor, setSnackbarBgcolor] = useState(Colors.green);
  const [alertMessage, setAlertMessage] = useState('');
  const dispatch = useDispatch();

  const handleCancelar = async () => {
    try {
      if (!cancelando && optionSelected !== '' && optionSelected !== 'otro') {
        setCancelando(true);
        const ticketCancelado = await cancelTicket(
          numeroBoleto,
          optionSelected,
        );
        if (ticketCancelado) {
          updateInterface(ticketCancelado);
        }
      }
      if (
        !cancelando &&
        optionSelected !== '' &&
        optionSelected == 'otro' &&
        otroContenido !== null &&
        otroContenido.trim().length > 0
      ) {
        setCancelando(true);
        const ticketCancelado = await cancelTicket(
          numeroBoleto,
          'otro',
          otroContenido,
        );
        if (ticketCancelado) {
          updateInterface(ticketCancelado);
        }
      }
    } catch ({message}) {
      // console.log(message);
      setAlertMessage(message);
      setSnackbarBgcolor('tomato');
      setOpenSnackbar(true);
      setOpenDialog(false);
      setTimeout(() => {
        closeDialog();
      }, 3000);
    }
  };

  const updateInterface = ticketCancelado => {
    dispatch(establecerCredito(ticketCancelado.nuevoSaldo));
    dispatch(
      agregarRegistroAlMomento({
        id: uuid(),
        fecha: ticketCancelado.fechaCancelacion,
        numeroBoleto: ticketCancelado.numeroBoleto,
        hora: ticketCancelado.horaCancelacion,
        total: -Math.abs(ticketCancelado.reembolso),
        tipo: 'cancelado',
      }),
    );
    setAlertMessage('El ticket se canceló correctamente');
    setOpenSnackbar(true);
    setOpenDialog(false);
    setTimeout(() => {
      closeDialog();
    }, 3000);
  };

  const handleChange = value => {
    setOptionSelected(value);
    setMotivoOtro(value === 'otro');
    setOtroContenido(null);
  };

  const handleChangeText = text => {
    setOtroContenido(text);
  };

  return (
    <Portal>
      <Dialog visible={openDialog} style={{backgroundColor: '#fff'}}>
        <Dialog.Title>Cancelar ticket</Dialog.Title>
        <Dialog.Content>
          {!cancelando && (
            <>
              <Text style={{color: Colors.primary, fontSize: 18}}>
                Motivo de cancelación
              </Text>
              <RadioButton.Group
                onValueChange={handleChange}
                value={optionSelected}>
                {via !== 'whatsapp' && (
                  <RadioButton.Item
                    disabled={cancelando}
                    label="Fallo de impresión"
                    value="fallo-impresion"
                  />
                )}
                <RadioButton.Item
                  disabled={cancelando}
                  label="Rechazo del cliente"
                  value="rechazo-cliente"
                />
                <RadioButton.Item
                  disabled={cancelando}
                  label="Otro"
                  value="otro"
                />
              </RadioButton.Group>
              {motivoOtro && (
                <TextInput
                  disabled={cancelando}
                  autoFocus
                  maxLength={100}
                  value={otroContenido}
                  onChangeText={handleChangeText}
                />
              )}
            </>
          )}
          {cancelando && (
            <Text style={{textAlign: 'justify', fontSize: 18}}>
              Recuerda que al cancelar un ticket éste no debe estar en
              circulación y es responsabilidad del usuario, si se detectan malas
              practicas es causante de baja del sistema.
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {!cancelando && <Button onPress={() => closeDialog()}>CERRAR</Button>}
          <Button
            mode={cancelando ? 'text' : 'contained'}
            loading={cancelando}
            onPress={handleCancelar}>
            {cancelando ? 'CANCELANDO' : 'CONFIRMAR'}
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar
        visible={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
        duration={3000}
        style={{backgroundColor: snackbarBgcolor}}>
        {alertMessage}
      </Snackbar>
    </Portal>
  );
}
