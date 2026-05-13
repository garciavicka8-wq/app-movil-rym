import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {useModal, useThermalPrinter, useCustomNavigation} from '../../../../../hooks';
import {getServerTime, requestRymAPIConfig} from '../../../../../services/http';
import {Colors, Moment, Money, Print, Utils} from '../../../../../utils';
import {Container, Content} from '../../../../../components/Layout';
import TicketSection from './TicketSection';
import CustomRow from './CustomRow';
import {CustomModal} from '../../../../../components';
import {Button, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {ERROR_CODE_NAMES, ERROR_NAMES} from '../../../../../errors';

export default function EstadoSemanal() {
  const {estadoDeCuenta: accountStatus} = useSelector(state => state.reportes);
  const thermalPrinter = useThermalPrinter();
  const modal = useModal();
  const reactNavigation = useNavigation();
  const navigation = useCustomNavigation();
  const [bankConfig, setBankConfig] = useState(null);

  useEffect(() => {
    reactNavigation.setOptions({
      headerTitle: 'Estado de Cuenta',
    });
    fetchBankConfig();
  }, []);

  const fetchBankConfig = async () => {
    try {
      const response = await requestRymAPIConfig({endpoint: 'ajustes/bancos', method: 'GET'});
      setBankConfig(response.data);
    } catch (e) {
      console.log('Error fetching bank configuration:', e);
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
        imprimirLiquidacion();
      }
    } catch ({message}) {
      if (
        message === 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        // useLogout hook logic would go here if needed, but keeping it simple
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
          <Text style={styles.errorText}>
            {message === ERROR_NAMES.CONNECTING_DEVICE_FAILED
              ? 'Verifica que la impresora esté encendida'
              : message}
          </Text>
        ),
      });
    }
  };

  const imprimirLiquidacion = async () => {
    try {
      const timestamp = await getServerTime();
      await thermalPrinter.print(async function () {
        await Print.accountStatus({
          ...accountStatus,
          fechaExp: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
          bankInfo: bankConfig,
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
        
        {/* CABECERA CON SALDO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ESTADO DE CUENTA</Text>
            <Text style={styles.periodText}>{Utils.periodToLongText(accountStatus.period)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.printBtnSmall}
            onPress={handlePrinterConnection}
          >
            <Icon name="printer" size={24} color="#0E1321" />
          </TouchableOpacity>
        </View>

        {/* CARD HERO - IMPORTE A PAGAR */}
        <Card style={styles.heroCard}>
          <Card.Content>
            <Text style={styles.heroLabel}>Importe a Pagar</Text>
            <Text style={styles.heroValue}>{Money(accountStatus.amount || accountStatus.toPay || 0)}</Text>
            <View style={styles.heroDivider} />
            <View style={styles.heroFooter}>
              <View style={styles.heroStat}>
                <Text style={styles.statLabel}>Saldo Anterior</Text>
                <Text style={styles.statValue}>{Money(accountStatus.lastInformAmount)}</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.statLabel}>Vencido</Text>
                <Text style={[styles.statValue, {color: '#FDA4AF'}]}>{Money(accountStatus.dueBalance)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* RESUMEN DE SALDOS ANTERIORES */}
        <TicketSection subtitle="RESUMEN DE SALDOS">
           <CustomRow
            cols={[
              `AL ${Moment(accountStatus.lastInformPeriodEnd).format('DD/MM/YY').toUpperCase()}`,
              Money(accountStatus.lastInformAmount),
            ]}
          />
          <CustomRow
            cols={['PAGOS LUN/MIE ANT.', Money(accountStatus.paidPrizesBeforeWeekPaymentLimitDay.total)]}
          />
          <CustomRow
            cols={['SU PAGO', Money(accountStatus.lastInformTotalDeposits)]}
          />
        </TicketSection>

        {/* VENTA SEMANAL */}
        <TicketSection subtitle="VENTA DE LA SEMANA">
          <CustomRow cols={['TICKET PLUS', accountStatus.tickets.recordsFound, Money(accountStatus.tickets.total)]} />
          <CustomRow cols={['RECARGAS', accountStatus.recharges.recordsFound, Money(accountStatus.recharges.total)]} />
          <CustomRow cols={['CARGO SERVICIO', accountStatus.recharges.recordsFound, Money(accountStatus.recharges.chargeToClientForService)]} />
          <CustomRow cols={['SERVICIOS', accountStatus.paidServices.recordsFound, Money(accountStatus.paidServices.total)]} />
          <CustomRow cols={['GIFT CARDS', accountStatus.giftCards.recordsFound, Money(accountStatus.giftCards.total)]} />
          <CustomRow header labelColor="#0E1321" cols={['TOTAL VENTAS', '', Money(accountStatus.totalSalesSum)]} />
        </TicketSection>

        {/* PREMIOS Y COMISIONES */}
        <TicketSection subtitle="PREMIOS Y COMISIONES">
          <CustomRow cols={['PREMIOS JUE-DOM', '', Money(accountStatus.paidPrizesAfterWeekPaymentLimitDay.total)]} />
          <CustomRow cols={['PREMIOS LUN-MIE ACT.', '', Money(accountStatus.nextPaidPrizesBeforeWeekPaymentLimitDayTotal)]} />
          <CustomRow cols={['TOTAL COMISIONES', '', Money(accountStatus.totalCommissionsSum)]} />
          <CustomRow header labelColor="#0E1321" cols={['A PAGAR SEMANA', '', Money(accountStatus.toPay)]} />
        </TicketSection>

        {/* CUENTAS BANCARIAS */}
        <Text style={styles.sectionHeading}>CUENTAS PARA DEPÓSITO</Text>
        {bankConfig?.cuentas && bankConfig.cuentas.map((c, i) => (
          <Card key={i} style={styles.bankCard}>
            <Card.Content>
              <View style={styles.bankRow}>
                <Icon name="bank" size={20} color="#64748B" />
                <Text style={styles.bankName}>{c.banco || 'BANCO'}</Text>
              </View>
              <View style={styles.bankDivider} />
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankLabel}>Titular:</Text>
                <Text style={styles.bankValue}>{c.titular || 'No especificado'}</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankLabel}>Cuenta/Clabe:</Text>
                <Text style={styles.bankValue}>{c.cuenta || '---'}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Button
          mode="contained"
          onPress={handlePrinterConnection}
          icon="printer"
          style={styles.mainPrintBtn}
          buttonColor="#0E1321"
          labelStyle={styles.printBtnLabel}
        >
          IMPRIMIR ESTADO COMPLETO
        </Button>

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
  title: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E1321',
  },
  periodText: {
    fontFamily: 'Inter',
    fontSize: 13,
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
  heroCard: {
    backgroundColor: '#0E1321',
    borderRadius: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#0E1321',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroValue: {
    fontFamily: 'Inter',
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 1,
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  bankDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  bankDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bankLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    width: 100,
  },
  bankValue: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  mainPrintBtn: {
    marginTop: 20,
    marginBottom: 40,
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
