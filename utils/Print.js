import {Moment, Utils} from '.';
import Helpers from './Helpers';
import Money from './Money';
const LOGO_URL =
  'https://recargasymas.com.mx/wp-content/uploads/2023/10/logo-ticket-100.jpg';

const Print = (() => {
  // TRANSACTION RECEIPT
  const transactionReceipt = transaccion => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
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
    //   CONTENT
    let receipContent = `[C]<img>${LOGO_URL}</img>\n`;
    receipContent += `[C]<font size='normal'>Comprobante transaccion</font>\n`;
    receipContent += `[C]<font size='normal'>${transaccion.Status}</font>\n`;
    receipContent += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    receipContent += `[L]<font size='normal'>Fecha: ${transaccion.Fecha}</font>\n`;
    receipContent += `[L]<font size='normal'>TransID: ${transaccion.TransID}</font>\n`;
    receipContent += `[L]<font size='normal'>Folio: ${transaccion.Folio}</font>\n`;
    receipContent += `[L]<font size='normal'>Prov.: ${transaccion.Carrier}</font>\n`;
    receipContent += `[L]<font size='normal'>Bolsa: ${transaccion.Bolsa}</font>\n`;
    receipContent += `[L]<font size='normal'>Ref.: ${transaccion.Telefono}</font>\n`;
    if (transaccion.CategoriaID == '4') {
      receipContent += `[L]<font size='normal'>Codigo: ${transaccion.pin}</font>\n`;
    }
    receipContent += `[L]<font size='normal'>Monto: ${transaccion.Monto}</font>\n`;
    receipContent += `[L]<font size='normal'>Comision: ${comision}</font>\n`;
    receipContent += `[L]<font size='normal'>Total: ${totalPagar}</font>\n`;
    receipContent += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    return receipContent;
  };
  //  CREATE MODEL FOR TICKET TO BE PRINTED
  const ticket = (ticketObj, isMagico = false) => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    let text = `[C]<img>${LOGO_URL}</img>\n`;
    let title = 'Ticket Plus';
    if (isMagico) {
      text = `[C]<img>https://recargasymas.com.mx/wp-content/uploads/2023/10/magico.jpg</img>\n`;
      title = 'Ticket Magico';
    }
    //   CONTENT
    text += `[C]<font size='big'>${title}</font>\n`;
    text += `[C]<font size='normal'>${Utils.getDrawName(
      ticketObj.codigoSorteo,
    )} ${Moment(ticketObj.fechaSorteo).format('ddd DD MMM YY')}</font>\n`;
    text += `[L]<font size='normal'>Impresion ${Moment(
      ticketObj.fechaExp,
    ).format('DD/MM/YYYY')} ${ticketObj.horaImpresion}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `${Utils.createTicketTableBetHeader(
      ticketObj.jugadas[0].lugares.length,
    )}\n`;
    ticketObj.jugadas.forEach(jugada => {
      text += `${Utils.createTicketTableBetRow(jugada)}`;
    });
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[L]<font size='normal'>Registros ${ticketObj.jugadas.length}</font>\n`;
    text += `[L]<font size='normal'>Total ${ticketObj.totalApostado}</font>\n`;
    text += `[L]<font size='normal'>ID ${ticketObj.numeroBoleto}</font>\n`;
    text += `[L]<font size='normal'>V1N ${Utils.generateRandomNumber(
      16,
    )}</font>\n`;
    text += `[L]<font size='normal'>CDS ${Utils.generateRandomNumber(
      8,
    )}</font>\n`;
    text += `[L]\n`;
    text += `[C]<qrcode size='15'>${ticketObj.numeroBoleto}</qrcode>\n`;
    text += `[L]<font size='normal'>------------------------------------------</font>\n`;
    text += `[C]<font size='normal'>www.recargasymas.com.mx</font>\n`;
    return text;
  };
  // CANCELED TICKET
  const canceledTicket = ticket => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    let text = `[C]<font size='normal'>Cancelado</font>\n`;
    text += `[C]<font size='normal'>${ticket.numeroBoleto}</font>\n`;
    text += `[L]<font size='normal'>Cancelacion ${Moment(
      ticket.timestamp,
    ).format('DD/MM/YYYY HH:mm:ss')}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Reembolso</font>\n`;
    text += `[C]<font size='normal'>${ticket.reembolso}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    return text;
  };
  // TOTAL ACCUMULATED
  const totalAccumulated = (timestamp, total, recordsList) => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    //   CONTENT
    let text = `[L]<font size='normal'>Fecha ${Moment(timestamp).format(
      'DD/MM/YYYY',
    )} ${Moment(timestamp).format('HH:mm:ss')}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[R]<font size='normal'>ID<font size='normal'>[R]<font size='normal'>Hora<font size='normal'>[R]<font size='normal'>Pts</font>\n`;
    recordsList.forEach(item => {
      text += Utils.createTotalAccumulatedTableRow(item);
    });
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[L]<font size='normal'>Total ${total} Pts</font>\n`;
    return text;
  };
  // PAYMENT TICKET
  const paymentTicket = informacionPago => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    //   CONTENT
    let text = `[C]<font size='normal'>Comprobante de Pago</font>\n`;
    text += `[C]<font size='normal'>${informacionPago.numeroBoleto}</font>\n`;
    text += `[L]<font size='normal'>Fecha ${informacionPago.fechaPago} ${informacionPago.horaPago}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Monto</font>\n`;
    text += `[C]<font size='normal'>${Money(informacionPago.premio)}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[L]<font size='normal'>Total ${total} Pts</font>\n`;
    return text;
  };

  const accountStatus = report => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    const {lastInform, lastInformPeriod} = report;
    let text = `[L]<img>${LOGO_URL}</img>\n`;
    text += `[C]<font size='normal'>Usuario ${report.nomComercial}</font>\n`;
    text += `[L]<font size='normal'>Periodo ${report.period.start} - ${report.period.end}</font>\n`;
    text += `[L]<font size='normal'>Impreso ${report.fechaExp}</font>\n`;
    text += `[L]<font size='normal'>Saldo ant. al ${Moment(
      lastInformPeriod.end,
    ).format('YYYY-MM-DD')} ${Money(lastInform.amount)}</font>\n`;
    if (report.paidPrizesOnMonday.total > 0) {
      text += `[L]<font size='normal'>P.pagados lun ant. ${Money(
        report.paidPrizesOnMonday.total,
      )}</font>\n`;
    }
    if (lastInform.totalDeposits > 0) {
      text += `[L]<font size='normal'>Su pago ${Money(
        lastInform.totalDeposits,
      )}</font>\n`;
    }
    if (report.dueBalance > 0) {
      text += `[L]<font size='normal'>Saldo vencido ${Money(
        report.dueBalance,
      )}</font>\n`;
    }
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Venta de la semana</font>\n`;
    if (report.tickets.total > 0) {
      text += `[L]<font size='normal'>Tickets ${Money(
        report.tickets.total,
      )}</font>\n`;
    }
    if (report.recharges.total > 0) {
      text += `[L]<font size='normal'>Recargas ${Money(
        report.recharges.total,
      )}</font>\n`;
    }
    if (report.recharges.chargeToClientForService > 0) {
      text += `[L]<font size='normal'>Com. cobrada al clte. ${Money(
        report.recharges.chargeToClientForService,
      )}</font>\n`;
    }
    if (report.paidServices.total > 0) {
      text += `[L]<font size='normal'>Servicios ${Money(
        report.paidServices.total,
      )}</font>\n`;
    }
    if (report.giftCards.total > 0) {
      text += `[L]<font size='normal'>Gift cards ${Money(
        report.giftCards.total,
      )}</font>\n`;
    }
    if (report.totalSalesSum > 0) {
      text += `[L]<font size='normal'>Total ventas ${Money(
        report.totalSalesSum,
      )}</font>\n`;
    }
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Premios y Comisiones</font>\n`;
    if (report.paidPrizesFromTuesdayToSunday.total > 0) {
      text += `[L]<font size='normal'>P.pagados mar a dom act ${Money(
        report.paidPrizesFromTuesdayToSunday.total,
      )}</font>\n`;
    }
    if (report.nextMondayPaidPrizes.total > 0) {
      text += `[L]<font size='normal'>P.pagados lun act ${Money(
        report.nextMondayPaidPrizes.total,
      )}</font>\n`;
    }
    if (report.tickets.commission > 0) {
      text += `[L]<font size='normal'>Com tickets ${Money(
        report.tickets.commission,
      )}</font>\n`;
    }
    if (report.recharges.commission > 0) {
      text += `[L]<font size='normal'>Com recargas ${Money(
        report.recharges.commission,
      )}</font>\n`;
    }
    if (report.paidServices.commission > 0) {
      text += `[L]<font size='normal'>Com servicios ${Money(
        report.paidServices.commission,
      )}</font>\n`;
    }
    if (report.giftCards.commission > 0) {
      text += `[L]<font size='normal'>Com gift cards ${Money(
        report.giftCards.commission,
      )}</font>\n`;
    }
    if (report.commissionChargedToClient > 0) {
      text += `[L]<font size='normal'>Com. cobrada al clte. ${Money(
        report.commissionChargedToClient,
      )}</font>\n`;
    }
    if (report.totalCommissionsSum > 0) {
      text += `[L]<font size='normal'>Total prem y com ${Money(
        report.totalCommissionsSum,
      )}</font>\n`;
    }
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Abonos, Ajustes y Reembolsos</font>\n`;
    if (report.payouts.total > 0) {
      text += `[L]<font size='normal'>Abonos ${Money(
        report.payouts.total,
      )}</font>\n`;
    }
    if (report.refunds.total > 0) {
      text += `[L]<font size='normal'>Reembolsos ${Money(
        report.refunds.total,
      )}</font>\n`;
    }
    if (report.adjustments.total > 0) {
      text += `[L]<font size='normal'>Ajustes ${Money(
        report.adjustments.total,
      )}</font>\n`;
    }
    if (report.totalPrizesAndCommissionsWithoutPayouts > 0) {
      text += `[L]<font size='normal'>Total prem y com menos abonos ${Money(
        report.totalPrizesAndCommissionsWithoutPayouts,
      )}</font>\n`;
    }
    if (report.canceledTickets.total > 0) {
      text += `[L]<font size='normal'>Cancelados ${Money(
        report.canceledTickets.total,
      )}</font>\n`;
    }
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Banco y Num Cta</font>\n`;
    text += `[L]<font size='normal'>Bancomer: 0172490303</font>\n`;
    text += `[L]<font size='normal'>Scotiabank: 25601299356</font>\n`;
    text += `[L]<font size='normal'>HSBC: 4056883101</font>\n`;
    text += `[L]<font size='normal'>B.Azteca: 01720107507910</font>\n`;
    text += `[L]<font size='normal'>R.Social: Desarrolladora de Sistemas Tecnologicos de Guerrero S.A. de C.V.</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    text += `[C]<font size='normal'>Importe</font>\n`;
    text += `[C]<font size='normal'>${Money(report.amount)}</font>\n`;
    text += `[C]<font size='normal'>${LINE_SEPARATOR}</font>\n`;
    return text;
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

  return {
    accountStatus,
    transactionReceipt,
    ticket,
    canceledTicket,
    totalAccumulated,
    paymentTicket,
    winningNumbers,
  };
})();

export default Print;
