import {ToastAndroid} from 'react-native';
import {Moment, Storage, Utils} from '.';
import Helpers from './Helpers';
import Money from './Money';
import {
  BluetoothEscposPrinter as BEP,
  ALIGN,
  ERROR_CORRECTION,
} from 'tp-react-native-bluetooth-printer';
import {
  AMOUNT_COL_SIZE_3,
  CHISPAZO_LOGO,
  MELATERR_LOGO2,
  PRINT_TABLE,
  PRINT_TABLE_HEADER,
} from '../constants';
const LOGO_URL =
  'https://recargasymas.com.mx/wp-content/uploads/2023/10/logo-ticket-100.jpg';
// SECCIONES AJUSTADAS
// REPORTE
// TICKET PLUS | MAGICO
// COMPROBANTE TRANSACCION
// CANCELAR BOLETO
// TOTAL ACUMULADO
// PAGO PREMIO

const Print = (() => {
  // TRANSACTION RECEIPT
  const transactionReceipt = async transaccion => {
    try {
      let comision = Helpers.sumWithDecimals(
        transaccion.Cargo,
        transaccion.Comision,
      );
      // SI ES RECARGA
      if (['1', '2'].includes(transaccion.CategoriaID)) {
        comision =
          transaccion._comisionRecargas !== undefined
            ? transaccion._comisionRecargas
            : Money(2);
      }
      const totalPagar = Helpers.sumWithDecimals(transaccion.Monto, comision);
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Comprobante transaccion\n\r`, {});
      await BEP.printText(`${transaccion.Status}\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText('################################\n\r', {});
      await BEP.printText(`Fecha: ${transaccion.Fecha}\n\r`, {});
      await BEP.printText(`TransID: ${transaccion.TransID}\n\r`, {});
      await BEP.printText(`Folio: ${transaccion.Folio}\n\r`, {});
      await BEP.printText(`Prov.: ${transaccion.Carrier}\n\r`, {});
      await BEP.printText(`Bolsa: ${transaccion.Bolsa}\n\r`, {});
      await BEP.printText(`Ref.: ${transaccion.Telefono}\n\r`, {});
      if (transaccion.CategoriaID == '4') {
        await BEP.printText(`Codigo: ${transaccion.pin}\n\r`, {});
      }
      await BEP.printText(`Monto: ${transaccion.Monto}\n\r`, {});
      await BEP.printText(`Comision: ${comision}\n\r`, {});
      await BEP.printText(`Total: ${totalPagar}\n\r`, {});
      await BEP.printText('################################\n\r', {});
      // SOLO SI TIENE LA DESCRIPCION DEL PRODUCTO
      // if (transaccion.descripcionProducto !== undefined) {
      //   await BEP.printText(`${transaccion.descripcionProducto}\n\r`, {});
      // }
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Gracias Por Su Preferencia\n\r`, {});
      await BEP.printText(`www.recargasymas.com.mx\n\r`, {});
      await BEP.printText('\n\r\n\r\n\r', {});
    } catch (error) {
      // console.log('error al imprimir', error);
      ToastAndroid.show('Error: impresora no conectada', ToastAndroid.LONG);
    }
  };
  //  CREATE MODEL FOR TICKET TO BE PRINTED
  const ticket = async (boleto, isMagico = false) => {
    try {
      try {
        // await BEP.printPic(isMagico ? LOGO_MAGICO_BASE64 : LOGO_BASE64, {
        //   width: 220,
        //   left: 80,
        // });
        await BEP.printerAlign(ALIGN.CENTER);
        await BEP.printText(isMagico ? 'TKT Magic\n\r' : 'TKT Pluss\n\r', {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 1,
          heigthtimes: 1,
          fonttype: 1,
        });
        await BEP.printText(
          `${Utils.obtenerNombreSorteo(boleto.codigoSorteo)} ${Moment(
            boleto.fechaSorteo,
          ).format('ddd DD MMM YY')}\n\r`,
          {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
          },
        );
        await BEP.printerAlign(ALIGN.LEFT);
        // await BEP.printText(`${usuarioStorage.nomComercial} \n\r`, {});
        await BEP.printText(
          `Impresion ${Moment(boleto.fechaExp).format('DD/MM/YYYY')} ${
            boleto.horaImpresion
          }\n\r`,
          {},
        );
        await BEP.printText('################################\n\r', {});

        await BEP.printColumn(
          PRINT_TABLE_HEADER[boleto.jugadas[0].lugares.length].colSizes,
          PRINT_TABLE_HEADER[boleto.jugadas[0].lugares.length].colAlignments,
          PRINT_TABLE_HEADER[boleto.jugadas[0].lugares.length].colData,
          {},
        );
        // IMPRIMIR JUGADAS
        boleto.jugadas.forEach(async jugada => {
          let rowData = jugada.lugares.map(item => {
            if (item.toString() == '0' || item.toString() == '') {
              return 'XXX';
            }
            return Utils.paddedNumber(item);
          });
          let colData = [Utils.paddedNumber(jugada.numero, '*'), ...rowData];
          await BEP.printColumn(
            PRINT_TABLE[colData.length].colSizes,
            PRINT_TABLE[colData.length].colAlignments,
            colData,
            {},
          );
        });
        await BEP.printText('################################\n\r', {});
        await BEP.printText(`Reg. ${boleto.jugadas.length}\n\r`, {});
        await BEP.printText(`Total ${boleto.totalApostado} Pts\n\r`, {});
        await BEP.printText(`ID ${boleto.numeroBoleto}\n\r`, {});
        await BEP.printText(`V1N ${Utils.generateRandomNumber(16)}\n\r`, {});
        await BEP.printText(`CDS ${Utils.generateRandomNumber(8)}\n\r`, {});
        await BEP.printerAlign(ALIGN.CENTER);
        await BEP.printQRCode(boleto.numeroBoleto, 120, ERROR_CORRECTION.L, 0);
        await BEP.printText(`\n\r\n\r`, {});
      } catch ({message}) {
        ToastAndroid.show(message, ToastAndroid.LONG);
      }
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // CANCELED TICKET
  const canceledTicket = async ticket => {
    try {
      const fechaImpresion = Moment(ticket.timestamp).format('DD/MM/YYYY');
      const horaImpresion = Moment(ticket.timestamp).format('HH:mm:ss');
      await BEP.printText('\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Cancelado\n\r`, {});
      await BEP.printText(`${ticket.numeroBoleto}\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText(
        `Cancelacion ${fechaImpresion} ${horaImpresion}\n\r`,
        {},
      );
      await BEP.printText('################################\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText('Reembolso\n\r', {});
      // IMPRIMIR MONTO PAGO
      await BEP.printText(`${Money(ticket.reembolso, false)}\n\r`, {
        widthtimes: 1,
        heigthtimes: 1,
      });
      await BEP.printText('################################\n\r', {});
      await BEP.printText('\n\r\n\r\n\r', {});
    } catch (error) {
      ToastAndroid.show('Error: impresora no conectada', ToastAndroid.LONG);
    }
  };
  // TOTAL ACCUMULATED
  const totalAccumulated = async (timestamp, total, recordsList) => {
    try {
      const usuarioStorage = Storage.getItem('usuario', true);
      const colWidth = BEP.width58 / 8 / 5;
      await BEP.printText('\n\r\n\r\n\r', {});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText(`${usuarioStorage.nomComercial}\n\r`, {});
      await BEP.printText(
        `Fecha ${Moment(timestamp).format('DD/MM/YYYY')} ${Moment(
          timestamp,
        ).format('HH:mm:ss')}\n\r`,
        {},
      );
      await BEP.printText('################################\n\r', {});
      // IMPRIMIR CABECERA
      await BEP.printColumn(
        [colWidth, colWidth, colWidth],
        [ALIGN.RIGHT, ALIGN.RIGHT, ALIGN.RIGHT],
        ['ID', 'Hora', 'Pts'],
        {},
      );
      // IMPRIMIR TABLA DE VENTA
      recordsList.forEach(async registro => {
        const TEXTO_TOTAL_APOSTADO = {
          boleto: registro.total.toString(),
          cancelado: registro.total.toString() + '(C)',
          pago: registro.total.toString() + '(P)',
        };
        await BEP.printColumn(
          [BEP.width58 / 8 / 4, colWidth, colWidth],
          [ALIGN.RIGHT, ALIGN.RIGHT, ALIGN.RIGHT],
          [
            Utils.shortenID(registro.numeroBoleto).toString(),
            registro.hora.toString(),
            TEXTO_TOTAL_APOSTADO[registro.tipo],
          ],
          {},
        );
      });
      // TOTAL VENDIDO
      await BEP.printText('################################\n\r', {});
      await BEP.printText(`Total ${total} Pts\n\r`, {});
      await BEP.printText('\n\r\n\r\n\r', {});
    } catch (error) {
      console.log('error al imprimir', error);
      ToastAndroid.show('Error: impresora no conectada', ToastAndroid.LONG);
    }
  };
  // PAYMENT TICKET
  const paymentTicket = async informacionPago => {
    try {
      await BEP.printText('\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Comprobante de Pago\n\r`, {});
      await BEP.printText(`${informacionPago.numeroBoleto}\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText(
        `Fecha ${informacionPago.fechaPago} ${informacionPago.horaPago}\n\r`,
        {},
      );
      await BEP.printText('################################\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText('Monto\n\r', {});
      // IMPRIMIR MONTO PAGO
      await BEP.printText(`${Money(informacionPago.premio)}\n\r`, {
        widthtimes: 1,
        heigthtimes: 1,
      });
      await BEP.printText('################################\n\r', {});
      await BEP.printText('\n\r\n\r\n\r', {});
    } catch (error) {
      // console.log('error al imprimir', error);
      ToastAndroid.show('Error: impresora no conectada', ToastAndroid.LONG);
    }
  };

  const accountStatus = async accountStatus => {
    try {
      const {lastInform, lastInformPeriod} = accountStatus;
      // await BEP.printPic(LOGO_BASE64, {width: 220, left: 80});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText(`Exp. ${accountStatus.fechaExp}\n\r`, {});
      await BEP.printText(`${accountStatus.nomComercial}\n\r`, {});
      await BEP.printText(
        `Sem. ${accountStatus.period.start} - ${accountStatus.period.end}\n\r`,
        {},
      );
      await BEP.printText(
        `S.Ant. al ${Moment(lastInformPeriod.end).format('YYYY-MM-DD')} ${Money(
          lastInform.amount,
        )}\n\r`,
        {},
      );
      if (accountStatus.paidPrizesOnMonday.total > 0) {
        await BEP.printText(
          `P.pagados lun ant. ${Money(
            accountStatus.paidPrizesOnMonday.total,
          )}\n\r`,
          {},
        );
      }
      if (lastInform.totalDeposits > 0) {
        await BEP.printText(
          `Su pago ${Money(lastInform.totalDeposits)}\n\r`,
          {},
        );
      }
      if (accountStatus.dueBalance > 0) {
        await BEP.printText(
          `Saldo vencido ${Money(accountStatus.dueBalance)}\n\r`,
          {},
        );
      }
      await BEP.printText('################################\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Venta de la semana\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      if (accountStatus.tickets.total > 0) {
        await BEP.printText(
          `Tickets ${Money(accountStatus.tickets.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.recharges.total > 0) {
        await BEP.printText(
          `Recargas ${Money(accountStatus.recharges.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.recharges.chargeToClientForService > 0) {
        await BEP.printText(
          `Com. cobrada al clte. ${Money(
            accountStatus.recharges.chargeToClientForService,
          )}\n\r`,
          {},
        );
      }
      if (accountStatus.paidServices.total > 0) {
        await BEP.printText(
          `Servicios ${Money(accountStatus.paidServices.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.giftCards.total > 0) {
        await BEP.printText(
          `Gift cards ${Money(accountStatus.giftCards.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.totalSalesSum > 0) {
        await BEP.printText(
          `Total ventas ${Money(accountStatus.totalSalesSum)}\n\r`,
          {},
        );
      }
      await BEP.printText('################################\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Prem. y Com.\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      if (accountStatus.paidPrizesFromTuesdayToSunday.total > 0) {
        await BEP.printText(
          `P.pagados mar a dom act ${Money(
            accountStatus.paidPrizesFromTuesdayToSunday.total,
          )}\n\r`,
          {},
        );
      }
      if (accountStatus.nextMondayPaidPrizes.total > 0) {
        await BEP.printText(
          `P.pagados lun act ${Money(
            accountStatus.nextMondayPaidPrizes.total,
          )}\n\r`,
          {},
        );
      }
      if (accountStatus.tickets.commission > 0) {
        await BEP.printText(
          `Com tickets ${Money(accountStatus.tickets.commission)}\n\r`,
          {},
        );
      }
      if (accountStatus.recharges.commission > 0) {
        await BEP.printText(
          `Com recargas ${Money(accountStatus.recharges.commission)}\n\r`,
          {},
        );
      }
      if (accountStatus.paidServices.commission > 0) {
        await BEP.printText(
          `Com servicios ${Money(accountStatus.paidServices.commission)}\n\r`,
          {},
        );
      }
      if (accountStatus.giftCards.commission > 0) {
        await BEP.printText(
          `Com gift cards ${Money(accountStatus.giftCards.commission)}\n\r`,
          {},
        );
      }
      if (accountStatus.commissionChargedToClient > 0) {
        await BEP.printText(
          `Com. cobrada al clte. ${Money(
            accountStatus.commissionChargedToClient,
          )}\n\r`,
          {},
        );
      }
      if (accountStatus.totalCommissionsSum > 0) {
        await BEP.printText(
          `Total prem y com ${Money(accountStatus.totalCommissionsSum)}\n\r`,
          {},
        );
      }
      await BEP.printText('################################\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Abonos, Ajustes y Reembolsos\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      if (accountStatus.payouts.total > 0) {
        await BEP.printText(
          `Abonos ${Money(accountStatus.payouts.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.refunds.total > 0) {
        await BEP.printText(
          `Reembolsos ${Money(accountStatus.refunds.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.adjustments.total > 0) {
        await BEP.printText(
          `Ajustes ${Money(accountStatus.adjustments.total)}\n\r`,
          {},
        );
      }
      if (accountStatus.totalPrizesAndCommissionsWithoutPayouts > 0) {
        await BEP.printText(
          `T.P. y C. - A.${Money(
            accountStatus.totalPrizesAndCommissionsWithoutPayouts,
          )}\n\r`,
          {},
        );
      }
      if (accountStatus.canceledTickets.total > 0) {
        await BEP.printText(
          `Cancelados ${Money(accountStatus.canceledTickets.total)}\n\r`,
          {},
        );
      }
      await BEP.printText('################################\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`Banco y Num Cta\n\r`, {});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText(`Bancomer: 0172490323\n\r`, {});
      await BEP.printText(`Scotiabank: 25601299356\n\r`, {});
      await BEP.printText(`HSBC: 4056883101\n\r`, {});
      await BEP.printText(`B.Azteca: 01720107507910\n\r`, {});
      await BEP.printText(
        `Desarrolladora de Sistemas\n\rTecnologicos de Guerrero\n\rS.A. de C.V.\n\r`,
        {},
      );
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText('################################\n\r', {});
      await BEP.printText(`Importe\n\r`, {});
      await BEP.printText(`${Money(accountStatus.amount)}\n\r`, {});
      await BEP.printText('################################\n\r', {});
      await BEP.printText('\n\r\n\r\n\r\n\r', {});
    } catch ({message}) {
      ToastAndroid.show(message, ToastAndroid.LONG);
      throw new Error(message);
    }
  };

  const winningNumbers = (fechaSorteo, numeros) => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    const LUGARES = {
      1: 'er',
      2: 'do',
      3: 'er',
    };
    let text = `[C]<img>${LOGO_URL}</img>\n`;
    text += `[C]<font size='normal'>${Moment(fechaSorteo).format(
      'ddd DD MMM YY',
    )}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    // IMPRIMIR NUMEROS GANADORES
    numeros.forEach((n, index) => {
      const i = index + 1;
      text += `[L]<font size='normal'>${i}${LUGARES[i]} ${n}</font>\n`;
    });
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    return text;
  };

  const test = async () => {
    try {
      const COL_SIZE = BEP.width58 / 8 / 3;
      await BEP.printPic(CHISPAZO_LOGO, {width: 300, left: 40});
      await BEP.printColumn(
        [COL_SIZE, COL_SIZE],
        [ALIGN.LEFT, ALIGN.RIGHT],
        ['SORTEO 3867', 'MIE MAR 06 2024'],
        {},
      );
      await BEP.printColumn(
        [BEP.width58 / 8 / 2.5, BEP.width58 / 8 / 3.5],
        [ALIGN.LEFT, ALIGN.RIGHT],
        ['SUS NUMEROS SON:', 'MELATICO'],
        {},
      );
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText('================================\n\r', {});
      await BEP.printText('A. * 07 21 26 48 52 54\n\r', {});
      await BEP.printText('B.** 06 18 28 29 35 56\n\r', {});
      await BEP.printText('================================\n\r', {});
      await BEP.printText('** COMB. CON REVANCHA/REVANCHITA\n\r', {});
      await BEP.printerAlign(ALIGN.LEFT);
      await BEP.printText('MELATE COMB:     2X $15 $30\n\r', {});
      await BEP.printText('REVANCHA COMB:   2X $10 $20\n\r', {});
      await BEP.printText('REVANCHITA COMB: 1X $5  $5\n\r', {});
      await BEP.printText('Total: $55\n\r', {});
      await BEP.printText('Boleto: /120020818-05700001/\n\r', {});
      await BEP.printText('Numero: 4150-0565332507-206218\n\r', {
        encoding: 'UTF-8',
      });
      await BEP.printText('Terminal: 12002409000\n\r', {});
      await BEP.printColumn(
        [BEP.width58 / 8 / 2.5, BEP.width58 / 8 / 3.5],
        [ALIGN.LEFT, ALIGN.RIGHT],
        ['MAR05/MAR 2024', '20:02:11 HCM'],
        {},
      );
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printQRCode('123456789', 120, ERROR_CORRECTION.L, 0);
      await BEP.printText('\n\n\n', {});
    } catch ({message}) {
      throw new Error(message);
    }
  };

  return {
    accountStatus,
    transactionReceipt,
    ticket,
    canceledTicket,
    totalAccumulated,
    paymentTicket,
    winningNumbers,
    test,
  };
})();

export default Print;
