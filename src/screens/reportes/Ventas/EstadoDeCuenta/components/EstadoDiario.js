import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {useModal, useThermalPrinter} from '../../../../../hooks';
import {getServerTime} from '../../../../../services/http';
import {Moment, Money, Print, Storage, Utils} from '../../../../../utils';
import {Container, Content} from '../../../../../components/Layout';
import TicketSection from './TicketSection';
import CustomRow from './CustomRow';
import {CustomModal} from '../../../../../components';
import {useNavigation} from '@react-navigation/native';
import {Card} from 'react-native-paper';
import {ERROR_CODE_NAMES} from '../../../../../errors';

export default function EstadoDiario() {
  const [usuario, setUsuario] = useState({nomComercial: ''});
  const {estadoDeCuenta: accountStatus, periodoSeleccionado} = useSelector(
    state => state.reportes,
  );
  const [ventaTitle, setVentaTitle] = useState('');
  const thermalPrinter = useThermalPrinter();
  const modal = useModal();
  const reactNavigation = useNavigation();

  useEffect(() => {
    cargarInfo();
  }, []);

  const cargarInfo = () => {
    reactNavigation.setOptions({
      headerTitle: 'Reporte Diario',
    });
    const _user = Storage.getItem('usuario', true);
    setUsuario(_user);
    if (periodoSeleccionado.hasOwnProperty('nombre')) {
      const nombreDia = periodoSeleccionado.nombre;
      setVentaTitle(
        nombreDia === 'semanal' ? 'VENTA DE LA SEMANA' : 'VENTA DEL DÍA',
      );
    }
  };

  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };

  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
  };

  const handlePrinterConnection = async () => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Imprimiendo',
      });
      
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible) {
        imprimirCorteCaja();
      }
    } catch ({message}) {
      modal.setConfig({open: false});
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        return;
      }
      if (message === 'PRINTING_NOT_POSSIBLE') {
        return;
      }
      Alert.alert('Mensaje', message);
    }
  };

  const imprimirCorteCaja = async () => {
    try {
      const timestamp = await getServerTime();
      await thermalPrinter.print(async function () {
        await Print.accountStatus({
          ...accountStatus,
          fechaExp: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
        });
      });
      modal.setConfig({open: false});
    } catch ({message}) {
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        error: <Text style={styles.errorText}>{message}</Text>,
        showCancelBtn: false,
        confirmBtnText: 'Entendido',
      });
    }
  };

  return (
    <Container style={styles.container}>
      <Content marginBottom={35} style={styles.content}>
        {/* CABECERA DE USUARIO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.userTitle}>{usuario.nomComercial.toUpperCase()}</Text>
            <Text style={styles.periodText}>{Utils.periodToLongText(accountStatus.period)}</Text>
          </View>
         
        </View>

        {/* CARD DE RESUMEN PRINCIPAL */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Total Venta Neta</Text>
            <Text style={styles.summaryValue}>{Money(accountStatus.totalSalesSum)}</Text>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.miniLabel}>Tickets</Text>
                <Text style={styles.miniValue}>{accountStatus.tickets.recordsFound}</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.miniLabel}>Saldo</Text>
                <Text style={styles.miniValue}>{Money(accountStatus.toPay || 0)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* SECCIONES DETALLADAS */}
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
              'CARGO SERVICIO',
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
            header
            labelColor="#0E1321"
            cols={['TOTAL VENTAS', '', Money(accountStatus.totalSalesSum)]}
          />
        </TicketSection>

        <TicketSection subtitle="PREMIOS">
          <CustomRow
            cols={[
              'LUNES A MIÉRCOLES',
              accountStatus.paidPrizesBeforeWeekPaymentLimitDay.recordsFound,
              Money(accountStatus.paidPrizesBeforeWeekPaymentLimitDay.total),
            ]}
          />
          <CustomRow
            cols={[
              'JUEVES A DOMINGO',
              accountStatus.paidPrizesAfterWeekPaymentLimitDay.recordsFound,
              Money(accountStatus.paidPrizesAfterWeekPaymentLimitDay.total),
            ]}
          />
        </TicketSection>

        <TicketSection subtitle="COMISIONES">
          <CustomRow
            cols={['TICKET PLUS', accountStatus.tickets.recordsFound, Money(accountStatus.tickets.commission)]}
          />
          <CustomRow
            cols={['RECARGAS', accountStatus.recharges.recordsFound, Money(accountStatus.recharges.commission)]}
          />
          <CustomRow
            cols={['PAGO SERVICIOS', accountStatus.paidServices.recordsFound, Money(accountStatus.paidServices.commission)]}
          />
          <CustomRow
            cols={['GIFT CARDS', accountStatus.giftCards.recordsFound, Money(accountStatus.giftCards.commission)]}
          />
          <CustomRow
            cols={['COBRADA AL CLIENTE', accountStatus.recharges.recordsFound, Money(accountStatus.commissionChargedToClient)]}
          />
        </TicketSection>

        <TicketSection subtitle="AJUSTES Y OTROS">
          <CustomRow
            cols={['ABONOS', accountStatus.payouts.recordsFound, Money(accountStatus.payouts.total)]}
          />
          <CustomRow
            cols={['REEMBOLSOS', accountStatus.refunds.recordsFound, Money(accountStatus.refunds.total)]}
          />
          <CustomRow
            cols={['AJUSTES', accountStatus.adjustments.recordsFound, Money(accountStatus.adjustments.total)]}
          />
          <CustomRow
            marginTop={20}
            toplined
            cols={['CANCELADOS', accountStatus.canceledTickets.recordsFound, Money(accountStatus.canceledTickets.total)]}
          />
        </TicketSection>

        
      </Content>

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
        onAccept={handleModalAccept}
        showCloseBtn={true}
        onClose={handleModalCancel}
      >
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userTitle: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0E1321',
    letterSpacing: -0.5,
  },
  periodText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  printBtnSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryCard: {
    backgroundColor: '#0E1321',
    borderRadius: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#0E1321',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryCol: {
    alignItems: 'center',
  },
  miniLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  miniValue: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mainPrintBtn: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 16,
    paddingVertical: 8,
  },
  printBtnLabel: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 14,
    textAlign: 'center',
    color: '#1E293B',
  }
});
