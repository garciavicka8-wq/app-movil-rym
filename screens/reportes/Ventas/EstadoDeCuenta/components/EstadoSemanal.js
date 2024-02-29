import React, {useEffect} from 'react';
import {
  useAlert,
  useBluetooth,
  useCustomNavigation,
  useModal,
  useThermalPrinter,
} from '../../../../../hooks';
import {APP_NAVIGATION} from '../../../../../constants';
import Database from '../../../../../database';
import {Colors, Moment, Money, Print, Utils} from '../../../../../utils';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Container, Content} from '../../../../../components/Layout';
import TicketSection from './TicketSection';
import CustomRow from './CustomRow';
import {CustomModal} from '../../../../../components';
import {Button} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../../errors';

export default function EstadoSemanal() {
  const {estadoDeCuenta: accountStatus} = useSelector(state => state.reportes);
  const {lastInform, lastInformPeriod} = accountStatus;
  const thermalPrinter = useThermalPrinter();
  const modal = useModal();
  const reactNavigation = useNavigation();

  useEffect(() => {
    reactNavigation.setOptions({headerTitle: 'Estado de cuenta'});
  }, []);

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
      // CHECK IF BLUETOOTH IS ENABLED AND PRINTER IS REGISTERED AND CONNECTED
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible) {
        // IMPRIMIR  REPORTE
        imprimirLiquidacion();
      }
    } catch ({message}) {
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      if (message === 'PRINTING_NOT_POSSIBLE') {
        modal.setConfig({open: false});
        return;
      }
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: (
          <Text>
            {message === ERROR_NAMES.CONNECTING_DEVICE_FAILED
              ? 'verifica que la impresora este encendida'
              : message}
          </Text>
        ),
      });
    }
  };

  const imprimirLiquidacion = async () => {
    try {
      const timestamp = await Database.getServerDate();
      const structure = Print.accountStatus({
        ...accountStatus,
        fechaExp: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      });
      await thermalPrinter.print(structure);
      modal.setConfig({open: false});
    } catch ({message}) {
      // console.log(message);
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
        <TicketSection title={Utils.periodToLongText(accountStatus.period)}>
          <CustomRow
            cols={[
              `SALDO ANTERIOR AL ${Moment(lastInformPeriod.end)
                .format('dddd DD MMMM YYYY')
                .toUpperCase()}`,
              Money(lastInform.amount),
            ]}
          />
          <CustomRow
            cols={[
              'PREMIOS PAGADOS LUNES ANTERIOR',
              Money(accountStatus.paidPrizesOnMonday.total),
            ]}
          />
          <CustomRow cols={['SU PAGO', Money(lastInform.totalDeposits)]} />
          <CustomRow
            cols={['SALDO VENCIDO', Money(accountStatus.dueBalance)]}
          />
        </TicketSection>
        <TicketSection subtitle="VENTA DE LA SEMANA">
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
        <TicketSection subtitle="PREMIOS Y COMISIONES">
          <CustomRow
            cols={[
              'PREMIOS PAGADOS MARTES A DOMINGO',
              accountStatus.paidPrizesFromTuesdayToSunday.recordsFound,
              Money(accountStatus.paidPrizesFromTuesdayToSunday.total),
            ]}
          />
          <CustomRow
            cols={[
              'PREMIOS PAGADOS LUNES ACTUAL',
              accountStatus.nextMondayPaidPrizes.recordsFound,
              Money(accountStatus.nextMondayPaidPrizes.total),
            ]}
          />
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
          <CustomRow
            cols={[
              'TOTAL PREMIOS Y COMISIONES',
              '',
              Money(accountStatus.totalCommissionsSum),
            ]}
          />
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
          <CustomRow
            cols={[
              'TOTAL PREMIOS Y COMISIONES MENOS ABONOS',
              '',
              Money(accountStatus.totalPrizesAndCommissionsWithoutPayouts),
            ]}
          />
          <CustomRow
            cols={[
              'CANCELADOS',
              accountStatus.canceledTickets.recordsFound,
              Money(accountStatus.canceledTickets.total),
            ]}
            underlined={false}
          />
          <CustomRow
            labelColor="black"
            header
            toplined
            paddingVertical={10}
            marginVertical={20}
            cols={['A PAGAR', '', Money(accountStatus.toPay)]}
          />
          <CustomRow header cols={['Banco', 'N°Cta']} underlined={false} />
          <CustomRow cols={['Bancomer', '0172490323']} underlined={false} />
          <CustomRow cols={['Scotiabank', '25601299356']} underlined={false} />
          <CustomRow cols={['HSBC', '4056883101']} underlined={false} />
          <CustomRow cols={['B.Azteca', '01720107507910']} underlined={false} />
          <CustomRow
            cols={[
              'R.Social',
              'Desarrolladora de Sistemas Tecnologicos de Guerrero S.A. de C.V.',
            ]}
            underlined={false}
          />
          <Importe importe={accountStatus.amount} />
          <Button
            onPress={handlePrinterConnection}
            icon="printer"
            uppercase
            mode="contained"
            buttonColor={Colors.dark}>
            Imprimir
          </Button>
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

function Importe({importe = 0}) {
  return (
    <View style={styles.importe}>
      <Text style={styles.importantText}>Importe</Text>
      <Text style={styles.importantText}>{Money(importe)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  importe: {
    marginVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
  },
  importantText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
