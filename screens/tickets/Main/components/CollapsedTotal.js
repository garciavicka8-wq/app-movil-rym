import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import {Colors, Moment, Print, Utils} from '../../../../utils';
import {useDispatch, useSelector} from 'react-redux';
import {
  useAlert,
  useBluetooth,
  useCustomNavigation,
  useModal,
  usePrinter,
} from '../../../../hooks';
import {APP_NAVIGATION} from '../../../../constants';
import Database from '../../../../database';
import {CustomModal} from '../../../../components';
import {setRegistrosAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import CancelarTicketDialog from './CancelarTicketDialog';
import {ERROR_NAMES} from '../../../../errors';

export default function CollapsedTotal() {
  const [showList, setShowList] = useState(true);
  const {registrosAlMomento} = useSelector(state => state.cliente);
  const dispatch = useDispatch();
  const navigation = useCustomNavigation();
  const modal = useModal();
  const bluetooth = useBluetooth();
  const printer = usePrinter();
  const alert = useAlert();
  const total = registrosAlMomento.reduce(
    (acc, b) => acc + parseInt(b.total),
    0,
  );
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
  };

  const handleClear = () => {
    dispatch(setRegistrosAlMomento([]));
  };

  const handlePrint = async () => {
    try {
      // VERIFICAR SI SE REGISTRO UNA IMPRESORA
      const registeredPrinter = await printer.getPrinterRegistered();
      if (registeredPrinter === null) {
        throw new Error(ERROR_NAMES.PRINTER_NOT_REGISTERED);
      }
      // VERIFICAR SI ESTA ACTIVO EL BLUETOOTH
      const isBluetoothEnabled = await bluetooth.isEnabled();
      if (!isBluetoothEnabled) {
        throw new Error(ERROR_NAMES.BLUETOOTH_NOT_ENABLED);
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Imprimiendo',
      });
      // REGISTRAMOS BOLETO
      printTotal();
    } catch ({message}) {
      modal.setConfig({open: false});
      if (message === ERROR_NAMES.PRINTER_NOT_REGISTERED) {
        alert.show(message, function () {
          navigation.navigate(APP_NAVIGATION.TABS.CONFIG);
        });
        return;
      }
      if (message === ERROR_NAMES.BLUETOOTH_NOT_ENABLED) {
        alert.show(message, async function () {
          await bluetooth.enable();
        });
        return;
      }
      Alert.alert('Mensaje', message);
    }
  };

  const printTotal = async () => {
    try {
      const timestamp = await Database.getServerDate();
      // IMPRIMIR
      const totalAccumulatedShape = Print.totalAccumulated(
        timestamp,
        total,
        registrosAlMomento,
      );
      await printer.print(totalAccumulatedShape);
      modal.setConfig({open: false});
    } catch ({message}) {
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: <Text>{message}</Text>,
      });
    }
  };

  return (
    <>
      <View style={styles.collapsedView}>
        <View style={styles.collapsedDialog}>
          <View style={styles.collapsedActions}>
            <Button
              buttonColor="transparent"
              textColor="#fff"
              uppercase
              contentStyle={{flexDirection: 'row-reverse'}}
              labelStyle={{fontWeight: 'bold'}}
              icon={showList ? 'chevron-down-circle' : 'chevron-up-circle'}
              onPress={() => setShowList(current => !current)}>
              Total {total} pts
            </Button>
            <View style={styles.collapsedIcons}>
              <IconButton
                iconColor="#fff"
                icon="delete"
                size={20}
                onPress={handleClear}
              />
              <IconButton
                iconColor="#fff"
                icon="printer"
                size={20}
                onPress={handlePrint}
              />
            </View>
          </View>
          {showList && (
            <View style={{backgroundColor: '#fff'}}>
              <ListaRegistros registros={registrosAlMomento} />
            </View>
          )}
        </View>
      </View>
      <CustomModal
        open={modal.config.open}
        type={modal.config.type}
        progressTitle={modal.config.progressTitle}
        alertTitle={modal.config.alertTitle}
        showCancelButton={modal.config.showCancelBtn}
        cancelButtonText={modal.config.cancelBtnText}
        confirmButtonText={modal.config.confirmBtnText}
        showConfirmBtn={modal.config.showConfirmBtn}
        onCancel={handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}

function ListaRegistros({registros = []}) {
  return (
    <View>
      {registros.length > 0 && (
        <Text style={{textAlign: 'center', fontSize: 18, marginVertical: 5}}>
          {Moment(registros[0].fecha).format('ddd DD MMMM YYYY')}
        </Text>
      )}
      <ScrollView style={{maxHeight: 250}}>
        {registros.map(registro => (
          <RegistroItem key={registro.id} registro={registro} />
        ))}
      </ScrollView>
    </View>
  );
}

function RegistroItem({registro}) {
  const [cancelarTicket, setCancelarTicket] = useState(false);
  const TEXTO_HORA = {
    boleto: 'registrado a las ',
    cancelado: 'cancelado a las ',
    pago: 'pagado a las ',
  };

  const handlePress = () => {
    if (registro.tipo === 'boleto') {
      setCancelarTicket(true);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onLongPress={handlePress}>
        <View style={styles.registroItem}>
          <View>
            <Text>{Utils.shortenID(registro.numeroBoleto)}</Text>
            <Text style={{fontSize: 12}}>
              {TEXTO_HORA[registro.tipo]} {registro.hora}
            </Text>
            {registro.tipo === 'boleto' && (
              <Text
                style={{
                  color: Colors.darkBlue,
                  fontStyle: 'italic',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}>
                presiona 5 seg para solicitar cancelación
              </Text>
            )}
          </View>
          <View>
            <Text
              style={{color: registro.tipo !== 'boleto' ? 'red' : undefined}}>
              {registro.total} pts
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {cancelarTicket && (
        <CancelarTicketDialog
          numeroBoleto={registro.numeroBoleto}
          via={registro.via !== undefined ? registro.via : ''}
          closeDialog={() => setCancelarTicket(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  collapsedView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
  },
  collapsedDialog: {
    width: '90%',
    backgroundColor: 'black',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderColor: 'rgba(0, 0, 0,0.2)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 10,
  },
  collapsedActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedIcons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  registroItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
});
