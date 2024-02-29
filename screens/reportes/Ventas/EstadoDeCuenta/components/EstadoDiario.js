import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';
import {useCustomNavigation, useModal, usePrinter} from '../../../../../hooks';
import {APP_NAVIGATION} from '../../../../../constants';
import Database from '../../../../../database';
import {Moment, Money, Print, Storage, Utils} from '../../../../../utils';
import {Container, Content} from '../../../../../components/Layout';
import TicketSection from './TicketSection';
import CustomRow from './CustomRow';
import {CustomModal} from '../../../../../components';
import {useNavigation} from '@react-navigation/native';
// import EnCaja from './EnCaja';

export default function EstadoDiario() {
  const [usuario, setUsuario] = useState({nomComercial: ''});
  const {estadoDeCuenta: accountStatus, periodoSeleccionado} = useSelector(
    state => state.reportes,
  );
  const [ventaTitle, setVentaTitle] = useState('');
  const printer = usePrinter();
  const modal = useModal();
  const navigation = useCustomNavigation();
  const reactNavigation = useNavigation();
  useEffect(() => {
    cargarInfo();
  }, []);
  const cargarInfo = () => {
    reactNavigation.setOptions({headerTitle: 'Reporte'});
    const _user = Storage.getItem('usuario', true);
    setUsuario(_user);
    if (periodoSeleccionado.hasOwnProperty('nombre')) {
      const nombreDia = periodoSeleccionado.nombre;
      setVentaTitle(
        nombreDia === 'semanal' ? 'VENTA DE LA SEMANA' : 'VENTA DEL DIA',
      );
    }
  };
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

  // HANDLE PRINTER CONNECTION
  const handlePrinterConnection = async () => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Imprimiendo',
      });
      const conexionEstablecida = await printer.connect();
      // SI SE CONECTO A IMPRESORA CORRECTAMENTE
      if (conexionEstablecida) {
        // IMPRIMIR  REPORTE
        imprimirCorteCaja();
      }
    } catch ({message}) {
      modal.setConfig({open: false});
      if (message === 'BLUETOOTH_NOT_ENABLED') {
        printer.handleActivateBluetooth();
        return;
      }
      if (message === 'PRINTER_NOT_REGISTERED') {
        printer.handleRegister(() => {
          navigation.navigate(APP_NAVIGATION.TABS.CONFIG);
        });
        return;
      }
      // UNKNOWN ERROR
      printer.toast(message);
    }
  };

  const imprimirCorteCaja = async () => {
    try {
      const timestamp = await Database.getServerDate();
      await Print.corteCaja({
        ...accountStatus,
        fechaExp: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      });
      modal.setConfig({open: false});
    } catch ({message}) {
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        error: <Text>{message}</Text>,
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
      });
    }
  };

  return (
    <Container>
      <Content marginBottom={35}>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>
          {usuario.nomComercial.toUpperCase()}
        </Text>
        <TicketSection title={Utils.periodToLongText(accountStatus.period)}>
          {/** REVISAR CALCULO */}
        </TicketSection>
        <TicketSection subtitle={ventaTitle}>
          <CustomRow
            cols={[
              'TICKET PLUS',
              accountStatus.tickets.recordsFound,
              Money(accountStatus.tickets.total),
            ]}
          />
          <CustomRow
            cols={[
              'RECARGAS',
              accountStatus.recharges.recordsFound,
              Money(accountStatus.recharges.total),
            ]}
          />
          <CustomRow
            cols={[
              'CARGO POR SERVICIO DE RECARGA AL CLIENTE',
              accountStatus.recharges.recordsFound,
              Money(accountStatus.recharges.chargeToClientForService),
            ]}
          />
          <CustomRow
            cols={[
              'SERVICIOS',
              accountStatus.paidServices.recordsFound,
              Money(accountStatus.paidServices.total),
            ]}
          />
          <CustomRow
            cols={[
              'GIFT CARDS',
              accountStatus.giftCards.recordsFound,
              Money(accountStatus.giftCards.total),
            ]}
          />
          <CustomRow
            cols={['TOTAL VENTAS', '', Money(accountStatus.totalSalesSum)]}
          />
        </TicketSection>
        <TicketSection subtitle="PREMIOS">
          <CustomRow
            cols={[
              'PAGOS LUNES',
              accountStatus.paidPrizesOnMonday.recordsFound,
              Money(accountStatus.paidPrizesOnMonday.total),
            ]}
          />
          <CustomRow
            cols={[
              'PAGOS MARTES A DOMINGO',
              accountStatus.paidPrizesFromTuesdayToSunday.recordsFound,
              Money(accountStatus.paidPrizesFromTuesdayToSunday.total),
            ]}
          />
        </TicketSection>
        <TicketSection subtitle="COMISIONES">
          <CustomRow
            cols={[
              'COMISION TICKET PLUS',
              accountStatus.tickets.recordsFound,
              Money(accountStatus.tickets.commission),
            ]}
          />
          <CustomRow
            cols={[
              'COMISION RECARGAS',
              accountStatus.recharges.recordsFound,
              Money(accountStatus.recharges.commission),
            ]}
          />
          <CustomRow
            cols={[
              'COMISION PAGO SERVICIOS',
              accountStatus.paidServices.recordsFound,
              Money(accountStatus.paidServices.commission),
            ]}
          />
          <CustomRow
            cols={[
              'COMISION GIFT CARDS',
              accountStatus.giftCards.recordsFound,
              Money(accountStatus.giftCards.commission),
            ]}
          />
          <CustomRow
            cols={[
              'COMISON COBRADA AL CLIENTE',
              accountStatus.recharges.recordsFound,
              Money(accountStatus.commissionChargedToClient),
            ]}
          />
          {/* <CustomRow
            cols={[
              'TOTAL PREMIOS Y COMISIONES',
              '',
              Money(accountStatus.totalCommissionsSum),
            ]}
          /> */}
        </TicketSection>
        <TicketSection subtitle="ABONOS, AJUSTES Y REEMBOLSOS">
          <CustomRow
            cols={[
              'ABONOS',
              accountStatus.payouts.recordsFound,
              Money(accountStatus.payouts.total),
            ]}
          />
          <CustomRow
            cols={[
              'REEMBOLSO',
              accountStatus.refunds.recordsFound,
              Money(accountStatus.refunds.total),
            ]}
          />
          <CustomRow
            cols={[
              'AJUSTES',
              accountStatus.adjustments.recordsFound,
              Money(accountStatus.adjustments.total),
            ]}
          />
          {/* <CustomRow
            cols={[
              'TOTAL PREMIOS Y COMISIONES MENOS ABONOS',
              '',
              Money(accountStatus.totalPrizesAndCommissionsWithoutPayouts),
            ]}
          /> */}
          <CustomRow
            marginTop={40}
            toplined
            cols={[
              'CANCELADOS',
              accountStatus.canceledTickets.recordsFound,
              Money(accountStatus.canceledTickets.total),
            ]}
          />
          {/* <Button
            style={{marginTop: 20}}
            onPress={handlePrinterConnection}
            icon="printer"
            uppercase
            mode="contained"
            buttonColor={Colors.dark}>
            Imprimir
          </Button> */}
        </TicketSection>
      </Content>
      {/* MODAL */}
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
        {modal.config.contentType === 'error' && modal.config.content}
      </CustomModal>
    </Container>
  );
}
