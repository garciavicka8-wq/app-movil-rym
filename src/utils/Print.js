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
  CHISPAZO_LOGO,
  PRINT_TABLE,
  PRINT_TABLE_HEADER,
  TKP_LOGO_URL,
} from '../constants';

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
      // IMPRIMIR MENSAJE PARA PAGO DE SERVICIOS
      if (transaccion.CategoriaID == '3') {
        await printServiceAdvice();
      }

      await alignText('center');
      await BEP.printText(`Gracias Por Su Preferencia\n\r`, {});
      await BEP.printText('\n\r\n\r\n\r', {});
    } catch (error) {
      // console.log('error al imprimir', error);
      ToastAndroid.show('Error: impresora no conectada', ToastAndroid.LONG);
    }
  };
  // MENSAJE PARA PAGO DE SERVICIOS
  const printServiceAdvice = async () => {
    const wrapText = (text, maxLineWidth) => {
      const words = text.split(' ');
      let lines = [];
      let currentLine = '';

      words.forEach(word => {
        if ((currentLine + word).length <= maxLineWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) lines.push(currentLine);
      return lines;
    };
    const removeAccents = text => {
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    const text = `Por favor, tenga en cuenta que solo podemos procesar pagos de recibos vigentes. Si intenta pagar un recibo vencido, el sistema no lo reconocera y podrian generarse cargos adicionales, como reconexion o multas, de los cuales no nos hacemos responsables. El pago puede tardar entre 24 y 48 horas habiles en reflejarse.Si realiza su pago durante fin de semana y dias festivos,  este proceso podria demorar un poco mas. En caso de que el importe no se refleje despues de este tiempo,  tendra un maximo de 48 horas adicionales para reportarlo y solicitar una aclaracion. Pasado ese plazo, no podremos realizar ajustes. Esto es para garantizar que su pago se procese correctamente y evitar inconvenientes`;

    const maxLineWidth = 32; // Ancho estándar de impresión para una impresora térmica de 58 mm
    const wrappedLines = wrapText(removeAccents(text), maxLineWidth);

    for (const line of wrappedLines) {
      await printLine(line); // Imprime cada línea ajustada al ancho
    }
  };
  //  CREATE MODEL FOR TICKET TO BE PRINTED
  const ticket = async (boleto, isMagico = false) => {
    // SI ESTA EN MODO DESARROLLO
    // if (__DEV__) return true;
    try {
      // TICKET HEADER
      await printTicketHeader(boleto, isMagico);
      // IMPRIMIR JUGADAS
      await printTicketBody(boleto);
      // PRINT TICKET FOOTER
      await printTicketFooter(boleto);
    } catch (e) {
      ToastAndroid.show(e.message, ToastAndroid.LONG);
      throw new Error(e);
    }
  };
  // REPRINT TICKET (PAUSADO NO FUNCIONA POR EL MOMENTO)
  const reprintTicket = async numeroBoleto => {
    return;
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

  const accountStatus = async accountStatusObj => {
    try {
      // AccountStatus HEADER
      await printAccountStatusHeader(accountStatusObj);
      // AccountStatus BODY
      await printAccountStatusBody(accountStatusObj);
      // BANK INFO
      await printBankInfo(accountStatusObj.bankInfo);
      // PRINT AccountStatus FOOTER
      await printAccountStatusFooter(accountStatusObj);
    } catch (error) {
      console.log(error);
      ToastAndroid.show(error.message, ToastAndroid.LONG);
      throw new Error(error.message);
    }
  };

  const winningNumbers = (fechaSorteo, numeros) => {
    const LINE_SEPARATOR = Utils.generateLineSeparator(28, '-');
    const LUGARES = {
      1: 'er',
      2: 'do',
      3: 'er',
    };
    let text = `[C]<img>${TKP_LOGO_URL}</img>\n`;
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
      await BEP.printQRCode('123456789', 220, ERROR_CORRECTION.L, 0);
      await BEP.printText('\n\n\n', {});
    } catch ({message}) {
      throw new Error(message);
    }
  };
  // PRIVATE FUNCTIONS
  // TICKET HEADER
  async function printAccountStatusHeader(accountStatus) {
    const {lastInformPeriodEnd, lastInformAmount, lastInformTotalDeposits, paidPrizesBeforeWeekPaymentLimitDay} = accountStatus;
    const staticFields = [
      {text: `Exp. ${accountStatus.fechaExp}`},
      {text: `${accountStatus.nomComercial}`},
      {
        text: `Sem. ${accountStatus.period.start} - ${accountStatus.period.end}`,
      },
      {
        text: `S.Ant. al ${Moment(lastInformPeriodEnd).format(
          'YYYY-MM-DD',
        )} ${Money(lastInformAmount)}`,
      },
    ];

    const conditionalFields = [
      {
        condition: paidPrizesBeforeWeekPaymentLimitDay.total > 0,
        text: `P.pagados lun a mie ant. ${Money(
          paidPrizesBeforeWeekPaymentLimitDay.total,
        )}`,
      },
      {
        condition: lastInformTotalDeposits > 0,
        text: `Su pago ${Money(lastInformTotalDeposits)}`,
      },
      {
        condition: accountStatus.dueBalance > 0,
        text: `Saldo vencido ${Money(accountStatus.dueBalance)}`,
      },
    ];

    await alignText('left');

    // Print static fields
    for (const field of staticFields) {
      await printLine(field.text);
    }

    // Print conditional fields
    for (const field of conditionalFields) {
      if (field.condition) {
        await printLine(field.text);
      }
    }

    await hashesSeparator();
  }
  // TICKET BODY
  async function printAccountStatusBody(accountStatus) {
    const sections = [
      {
        title: 'Venta de la semana',
        fields: [
          {label: 'Tickets', value: accountStatus.tickets.total},
          {label: 'Recargas', value: accountStatus.recharges.total},
          {
            label: 'Com. cobrada al clte.',
            value: accountStatus.recharges.chargeToClientForService,
          },
          {label: 'Servicios', value: accountStatus.paidServices.total},
          {label: 'Gift cards', value: accountStatus.giftCards.total},
          {label: 'Total ventas', value: accountStatus.totalSalesSum},
        ],
      },
      {
        title: 'Prem. y Com.',
        fields: [
          {
            label: 'P.pagados jue a dom act',
            value: accountStatus.paidPrizesAfterWeekPaymentLimitDay.total,
          },
          {
            label: 'P.pagados lun a mie act',
            value: accountStatus.nextPaidPrizesBeforeWeekPaymentLimitDayTotal,
          },
          {label: 'Com tickets', value: accountStatus.tickets.commission},
          {label: 'Com recargas', value: accountStatus.recharges.commission},
          {
            label: 'Com servicios',
            value: accountStatus.paidServices.commission,
          },
          {label: 'Com gift cards', value: accountStatus.giftCards.commission},
          {
            label: 'Com. cobrada al clte.',
            value: accountStatus.commissionChargedToClient,
          },
          {
            label: 'Total prem y com',
            value: accountStatus.totalCommissionsSum,
          },
        ],
      },
      {
        title: 'Abonos, Ajustes y Reembolsos',
        fields: [
          {label: 'Abonos', value: accountStatus.payouts.total},
          {label: 'Reembolsos', value: accountStatus.refunds.total},
          {label: 'Ajustes', value: accountStatus.adjustments.total},
          {
            label: 'T.P. y C. - A.',
            value: accountStatus.totalPrizesAndCommissionsWithoutPayouts,
          },
          {label: 'Cancelados', value: accountStatus.canceledTickets.total},
        ],
      },
    ];

    for (const section of sections) {
      await printSectionTitle(section.title);
      for (const field of section.fields) {
        if (field.value > 0) {
          await printLine(`${field.label} ${Money(field.value)}`);
        }
      }
      await hashesSeparator();
    }
  }

  // PRINT SECTION TITLE
  async function printSectionTitle(title) {
    await alignText('center');
    await printLine(title);
    await alignText('left');
  }

  // BANK INFO
  async function printBankInfo(bankInfo) {
    await hashesSeparator();
    await printSectionTitle('CUENTAS PARA DEPÓSITO');
    try {
      if (bankInfo && bankInfo.cuentas && Array.isArray(bankInfo.cuentas)) {
        for (let cta of bankInfo.cuentas) {
          if (cta.titular) {
            await printLine(`Tit: ${cta.titular}`);
          }
          await printLine(`Ban: ${cta.banco || ''}`);
          await printLine(`Cta: ${cta.cuenta || ''}`);
          await printLine('--------------------------------');
        }
      } else if (!bankInfo || !bankInfo.cuentas || bankInfo.cuentas.length === 0) {
        await printLine('Ninguna cuenta configurada.');
      }
    } catch (e) {
      console.log('Error printing bank info:', e);
    }
  }
  // TICKET FOOTER
  async function printAccountStatusFooter(accountStatus) {
    await alignText('center');
    await hashesSeparator();
    await printLine('Importe');
    await printLine(Money(accountStatus.amount));
    await hashesSeparator();
    await BEP.printText('\n\r\n\r\n\r\n\r', {});
  }
  // PRINT TICKET HEADER
  async function printTicketHeader(boleto, isMagico) {
    await alignText('center');
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
    await printLine(
      `Impresion ${Moment(boleto.fechaExp).format('DD/MM/YYYY')} ${
        boleto.horaImpresion
      }`,
    );

    await hashesSeparator();
  }
  // PRINT JUGADAS
  async function printTicketBody(boleto) {
    await BEP.printColumn(
      PRINT_TABLE_HEADER[boleto.jugadas[0].lugares.length].colSizes,
      PRINT_TABLE_HEADER[boleto.jugadas[0].lugares.length].colAlignments,
      PRINT_TABLE_HEADER[boleto.jugadas[0].lugares.length].colData,
      {},
    );
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
  }

  async function printTicketFooter(boleto) {
    await hashesSeparator();
    await printLine(`Reg. ${boleto.jugadas.length}`);
    await printLine(`Total ${boleto.totalApostado} Pts`);
    await printLine(`ID ${boleto.numeroBoleto}`);
    await printLine(`V1N ${Utils.generateRandomNumber(16)}`);
    await printLine(`COS ${Utils.generateRandomNumber(8)}`);
    await printLine(
      `Impresion ${Moment(boleto.fechaExp).format('DD/MM/YYYY')} ${
        boleto.horaImpresion
      }`,
    );

    await alignText('center');
    await BEP.printQRCode(boleto.numeroBoleto, 220, ERROR_CORRECTION.L, 0);
    await BEP.printText(`\n\r\n\r`, {});
  }

  async function alignText(alignment) {
    await BEP.printerAlign(alignment === 'left' ? ALIGN.LEFT : ALIGN.CENTER);
  }

  async function printLine(text) {
    await alignText('left');
    await BEP.printText(`${text}\n\r`, {});
  }

  async function hashesSeparator() {
    await BEP.printText('################################\n\r', {});
  }

  const qrTicket = async numeroBoleto => {
    try {
      await BEP.printText('\n\r', {});
      await BEP.printerAlign(ALIGN.CENTER);
      await BEP.printText(`${numeroBoleto}\n\r`, {});
      await BEP.printQRCode(numeroBoleto, 220, ERROR_CORRECTION.L, 0);
      await BEP.printText('\n\r\n\r\n\r', {});
    } catch (error) {
      ToastAndroid.show('Error: impresora no conectada', ToastAndroid.LONG);
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
    qrTicket,
    test,
  };
})();

export default Print;
