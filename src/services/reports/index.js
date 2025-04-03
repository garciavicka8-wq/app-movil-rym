import Database from '../../database';
import {ERROR_CODE_NAMES} from '../../errors';
import {Moment, Utils, Storage, uuid} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import {
  getPaidPrizesByRange,
  getPeriodFromMonday,
  getServerTimestamp,
  getUserWeekInform,
  saveUserWeekInform,
  updateDbUser,
} from '../common';
import * as Request from '../http';
import {DATABASE_TABLES, DEPOSIT_DAYS} from '../constants';
const {
  dateToDayLowerCase,
  ticketsSaleComision,
  calculateTransactionsSale,
  calculateTransactionsCommission,
  calculateCommissionChargedToClient,
  sumObjListByProp,
  getPreviousWeekPeriod,
  roundDecimals,
} = Utils;
// CALCULATES THE USER SELLS AND COMMISSIONS AND RETURNS AN OBJECT
// WITH ALL THE INFORMATION
// @param period Object = {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD}
// USER
export async function getUserAccountStatus(period, user) {
  try {
    console.log('here');
    const timestamp = await getServerTimestamp();
    const weekReport = await generateWeekReport(period);
    const weekInform = await createUserWeekInform(weekReport, user);
    const prevPeriod = getPreviousWeekPeriod(period);
    const nextPaidPrizes = await getPaidPrizesByRange(
      Moment(period.end).add(1, 'days').format('YYYY-MM-DD'), // MONDAY
      Moment(period.end).add(3, 'days').format('YYYY-MM-DD'), // WEDNESDAY
    );
    const userNextPaidPrizes = nextPaidPrizes.filter(
      item => item.pagadoPor == user.usuario,
    );
    const totalUserNextPaidPrizes = userNextPaidPrizes.reduce(
      (acc, item) => acc + parseFloat(item.premio),
      0,
    );
    const reference = period.start + ':' + period.end + ':' + user.usuario;
    // INFORM CREATED FOR CURRENT PERIOD
    let inform = await getUserWeekInform(reference);
    // INFORM CREATED LAST WEEK
    let lastInform = await getUserWeekInform(
      prevPeriod.start + ':' + prevPeriod.end + ':' + user.usuario,
    );
    // IF LAST INFORM DOERS NOT EXISTS
    if (!lastInform) {
      lastInform = {
        dueBalance: 0,
      };
    }
    // VRIFY IF PERIOD BELONGS TO PAST WEEK AND CREATE A NEW INFORM
    // FOR CURRENT PERIOD
    if (
      !Moment(period.start).isSame(Moment(period.end)) &&
      !Moment(period.end).isSame(Moment(timestamp).format('YYYY-MM-DD')) &&
      !inform
    ) {
      const weekAmount =
        lastInform.dueBalance +
        weekInform.amount -
        weekInform.paidPrizesBeforeWeekPaymentLimitDay.total;
      const userInform = {
        id: uuid(),
        user: user.usuario,
        period: period.start + ':' + period.end,
        reference,
        totalDeposits: roundDecimals(weekInform.deposits.total),
        numDeposits: weekInform.deposits.recordsFound,
        amount: roundDecimals(weekAmount),
        dueBalance: roundDecimals(weekAmount - weekInform.deposits.total),
        created: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
        modified: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
        paymentCompleted: false,
      };
      await saveUserWeekInform(userInform);
    }

    return {
      ...weekInform,
      toPay:
        lastInform.dueBalance +
        weekInform.amount -
        weekInform.paidPrizesBeforeWeekPaymentLimitDay.total,
      amount:
        lastInform.dueBalance +
        weekInform.amount -
        weekInform.paidPrizesBeforeWeekPaymentLimitDay.total -
        totalUserNextPaidPrizes,
      lastInform,
      lastInformPeriod: prevPeriod,
      dueBalance:
        lastInform.dueBalance -
        weekInform.paidPrizesBeforeWeekPaymentLimitDay.total,
      nomComercial: user.nomComercial,
      nextPaidPrizesBeforeWeekPaymentLimitDay: {
        total: totalUserNextPaidPrizes,
        recordsFound: userNextPaidPrizes.length,
      },
    };
  } catch ({message}) {
    throw new Error(message);
  }
}
// GENERATE A WEEK REPORT FROM A GIVEN PERIOD
// IF NOT PERIOD IS GIVEN IT THEN CREATES A PERIOD
// FROM MONDAY TO NOW
// @param object = {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
export async function generateWeekReport(period = null) {
  try {
    let _period = period; // { start: "", end: "" };
    // IF PERIOD IS NULL THEN GENERATE A PERIOD FROM MONDAY TO NOW
    if (period === null) {
      const serverTimestamp = await getServerTimestamp();
      _period = getPeriodFromMonday(serverTimestamp);
    }
    const tickets = await Database.getItemsInRange(
      DATABASE_TABLES.TICKETS,
      'fechaExp',
      _period.start,
      _period.end,
    );
    const transactions = await Database.getItemsInRange(
      DATABASE_TABLES.TRANSACTIONS,
      '_fecha',
      _period.start,
      _period.end,
      txn => txn.Status === 'Exitosa' || txn.Status === 'PROCESSING',
    );
    const paidPrizes = await Database.getItemsInRange(
      DATABASE_TABLES.PAID_PRIZES,
      'fechaPago',
      _period.start,
      _period.end,
    );
    const payouts = await Database.getItemsInRange(
      DATABASE_TABLES.PAYOUTS,
      'fechaAbono',
      _period.start,
      _period.end,
    );
    const deposits = await Database.getItemsByProp(
      DATABASE_TABLES.DEPOSITS,
      'periodo',
      _period.start + ':' + _period.end,
    );
    const canceledTickets = await Database.getItemsInRange(
      DATABASE_TABLES.CANCELED_TICKETS,
      'fechaCancelacion',
      _period.start,
      _period.end,
    );
    const pastDueBalances = await Database.getItems(
      DATABASE_TABLES.PAST_DUE_BALANCES,
    );

    return {
      // CANCELADOS
      canceledTickets,
      // DEPOSITOS
      deposits,
      // PAGOS DE PREMIOS
      paidPrizes,
      // ABONOS
      payouts,
      // SALDOS VENCIDOS
      pastDueBalances,
      // PERIODOS
      period: _period,
      // TICKETS
      tickets,
      // TRANSACCIONES
      transactions,
    };
  } catch ({message}) {
    throw new Error(message);
  }
}
// CREATE USER WEEK INFORM
export async function createUserWeekInform(weekReport, user) {
  try {
    const userWeekReport = getUserWeekReport(weekReport, user);
    const {period} = userWeekReport;
    // SELLS
    const ticketsTotalSale = userWeekReport.tickets.reduce(
      (acc, el) => acc + parseInt(el.totalApostado),
      0,
    );
    const totalPaidPrizes = userWeekReport.paidPrizes.reduce(
      (acc, item) => acc + parseFloat(item.premio),
      0,
    );
    const paidPrizesBeforeWeekPaymentLimitDay =
      userWeekReport.paidPrizes.filter(item =>
        ['lunes', 'martes', 'miercoles'].includes(
          dateToDayLowerCase(item.fechaPago),
        ),
      );
    const totalPaidPrizesBeforeWeekPaymentLimitDay =
      paidPrizesBeforeWeekPaymentLimitDay.reduce(
        (acc, item) => acc + parseFloat(item.premio),
        0,
      );
    const paidPrizesAfterWeekPaymentLimitDay = userWeekReport.paidPrizes.filter(
      item =>
        ['jueves', 'viernes', 'sabado', 'domingo'].includes(
          dateToDayLowerCase(item.fechaPago),
        ),
    );
    const totalPaidPrizesAfterWeekPaymentLimitDay =
      paidPrizesAfterWeekPaymentLimitDay.reduce(
        (acc, item) => acc + parseFloat(item.premio),
        0,
      );
    const airTime = calculateTransactionsSale(userWeekReport.transactions, '1');
    const packages = calculateTransactionsSale(
      userWeekReport.transactions,
      '2',
    );
    const paidServices = calculateTransactionsSale(
      userWeekReport.transactions,
      '3',
    );
    const giftcards = calculateTransactionsSale(
      userWeekReport.transactions,
      '4',
    );
    const rechargeRecordsFound = airTime.recordsFound + packages.recordsFound;
    const commissionChargedToClient = calculateCommissionChargedToClient(
      userWeekReport.transactions,
    );
    const rechargeTotalSale = airTime.total + packages.total;
    // VERIFICAR PERIODO DEL 2023-08-28 AL 2023-09-03
    let commissionChargedToC = commissionChargedToClient;
    if (
      Moment(period.start).isSameOrBefore(Moment('2023-08-28')) &&
      Moment(period.end).isSameOrBefore(Moment('2023-09-03'))
    ) {
      commissionChargedToC = 0;
    }
    const totalSalesSum =
      ticketsTotalSale +
      rechargeTotalSale +
      paidServices.total +
      giftcards.total +
      commissionChargedToC;
    // COMMISSIONS
    const ticketsCommission = ticketsSaleComision(ticketsTotalSale);
    const airTimeCommission = calculateTransactionsCommission(
      userWeekReport.transactions,
      '1',
    );
    const packagesCommission = calculateTransactionsCommission(
      userWeekReport.transactions,
      '2',
    );
    const paidServicesCommission = calculateTransactionsCommission(
      userWeekReport.transactions,
      '3',
    );
    const giftCardsCommission = calculateTransactionsCommission(
      userWeekReport.transactions,
      '4',
    );
    // VERIFICAR PERIODO DEL 2023-08-28 AL 2023-09-03
    let paidPrizes = totalPaidPrizesAfterWeekPaymentLimitDay;
    if (
      Moment(period.start).isSameOrBefore(Moment('2023-08-28')) &&
      Moment(period.end).isSameOrBefore(Moment('2023-09-03'))
    ) {
      paidPrizes = totalPaidPrizes;
    }
    const totalCommissionsSum =
      paidPrizes +
      ticketsCommission +
      airTimeCommission +
      packagesCommission +
      paidServicesCommission +
      giftCardsCommission +
      commissionChargedToClient;
    const totalPayouts = sumObjListByProp(userWeekReport.payouts, 'cantidad');
    const totalPaidPrizesPayouts = 0;
    const totalRefunds = sumObjListByProp(userWeekReport.refunds, 'cantidad');
    const totalAdjustments = sumObjListByProp(
      userWeekReport.adjustments,
      'cantidad',
    );
    const totalPrizesAndCommissionsWithoutPayouts =
      totalCommissionsSum -
      totalPayouts -
      totalPaidPrizesPayouts +
      (totalRefunds + totalAdjustments);
    const amount = totalSalesSum - totalPrizesAndCommissionsWithoutPayouts;
    const cash =
      totalSalesSum +
      (totalPayouts - totalPaidPrizes) +
      commissionChargedToClient;
    // USER WEEK INFORM
    return {
      period: weekReport.period,
      user: user.usuario,
      tickets: {
        total: ticketsTotalSale,
        recordsFound: userWeekReport.tickets.length,
        commission: ticketsCommission,
      },
      canceledTickets: {
        total: sumObjListByProp(userWeekReport.canceledTickets, 'reembolso'),
        recordsFound: userWeekReport.canceledTickets.length,
      },
      paidPrizes: {
        total: totalPaidPrizes,
        recordsFound: paidPrizes.length,
      },
      paidPrizesBeforeWeekPaymentLimitDay: {
        total: totalPaidPrizesBeforeWeekPaymentLimitDay,
        recordsFound: paidPrizesBeforeWeekPaymentLimitDay.length,
        commission: 0,
      },
      paidPrizesAfterWeekPaymentLimitDay: {
        total: totalPaidPrizesAfterWeekPaymentLimitDay,
        recordsFound: paidPrizesAfterWeekPaymentLimitDay.length,
        commission: 0,
      },
      recharges: {
        total: rechargeTotalSale,
        recordsFound: rechargeRecordsFound,
        commission: airTimeCommission + packagesCommission,
        chargeToClientForService: commissionChargedToClient,
      },
      paidServices: {
        total: paidServices.total,
        recordsFound: paidServices.recordsFound,
        commission: paidServicesCommission,
      },
      giftCards: {
        total: giftcards.total,
        recordsFound: giftcards.recordsFound,
        commission: giftCardsCommission,
      },
      payouts: {
        total: totalPayouts,
        recordsFound: userWeekReport.payouts.length,
      },
      // WILL NOT LONGER WORK
      paidPrizesPayouts: {
        total: totalPaidPrizesPayouts,
        recordsFound: userWeekReport.paidPrizesPayouts.length,
      },
      refunds: {
        total: totalRefunds,
        recordsFound: userWeekReport.refunds.length,
      },
      adjustments: {
        total: totalAdjustments,
        recordsFound: userWeekReport.adjustments.length,
      },
      deposits: {
        total: sumObjListByProp(userWeekReport.deposits, 'pago'),
        recordsFound: userWeekReport.deposits.length,
        list: userWeekReport.deposits,
      },
      totalSalesSum,
      totalCommissionsSum,
      commissionChargedToClient,
      totalPrizesAndCommissionsWithoutPayouts,
      amount,
      // ONLY FOR APP
      cash,
    };
  } catch ({message}) {
    throw new Error(message);
  }
}
// RETURNS A USER ACOUNT STATUS FROM A GIVEN WEEK REPORT
export function getUserWeekReport(weekReport, user) {
  const {
    canceledTickets,
    deposits,
    paidPrizes,
    payouts,
    pastDueBalances,
    period,
    tickets,
    transactions,
  } = weekReport;
  return {
    adjustments: payouts.filter(
      item => item.agenciaId === user.id && item.tipo === 'ajuste',
    ),
    canceledTickets: canceledTickets.filter(
      item => item.agencia === user.usuario,
    ),
    deposits: deposits.filter(item => item.usuario === user.usuario),
    paidPrizes: paidPrizes.filter(item => item.pagadoPor === user.usuario),
    payouts: payouts.filter(
      item => item.agenciaId === user.id && item.tipo === 'abono',
    ),
    paidPrizesPayouts: payouts.filter(
      item => item.agenciaId === user.id && item.tipo === 'pago-premios',
    ),
    refunds: payouts.filter(
      item => item.agenciaId === user.id && item.tipo === 'reembolso',
    ),
    pastDueBalances: pastDueBalances.filter(
      item => item.usuario === user.usuario,
    ),
    period,
    tickets: tickets.filter(item => item.numeroAgencia === user.usuario),
    transactions: transactions.filter(item => item._usuario === user.usuario),
  };
}
// VERIFY USER ACCOUNT STATUS
export async function verifyUserAccountStatus() {
  try {
    const userDB = await obtenerUsuarioDb();
    const timestamp = await getServerTimestamp();
    const currentPeriod = getPeriodFromMonday(timestamp);
    const prevPeriod = getPreviousWeekPeriod(currentPeriod);
    const beforePrevPeriod = getPreviousWeekPeriod(prevPeriod);
    const prevInform = await getUserWeekInform(
      prevPeriod.start + ':' + prevPeriod.end + ':' + userDB.usuario,
    );
    const beforePrevInform = await getUserWeekInform(
      beforePrevPeriod.start +
        ':' +
        beforePrevPeriod.end +
        ':' +
        userDB.usuario,
    );
    // IF USER HAS DUE PAYMENTS BEHIND
    // LOG USER OUT AND UPDATE DISABLE ACCOUNT REASON PROP
    if (
      beforePrevInform &&
      prevInform &&
      !beforePrevInform.paymentCompleted &&
      !prevInform.paymentCompleted
    ) {
      await updateDbUser(userDB.key, {
        activo: false,
        disableAccountReason:
          'Su cuenta ha sido desactivada debido a que tiene un pago atrasado sin cubrir.',
      });
      throw new Error(ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT);
    }
    // IF USER HAS PAID DUE BALANCES SO FAR EXCEPT THE LAST ONE
    // LOG USER OUT AND UPDATE DISABLE ACCOUNT REASON PROP
    if (
      DEPOSIT_DAYS.OUT_OF_LIMIT.includes(
        Moment(timestamp).format('dddd').toLowerCase(),
      ) &&
      beforePrevInform &&
      prevInform &&
      beforePrevInform.paymentCompleted &&
      !prevInform.paymentCompleted
    ) {
      console.log('verifyUserAccountStatus line: 464');
      await updateDbUser(userDB.key, {
        activo: false,
        disableAccountReason: `Su cuenta ha sido desactivada debido a que no ha cubierto en su totalidad el pago de liquidación semanal de ${prevInform.amount}`,
      });
      throw new Error(ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT);
    }
  } catch ({message}) {
    throw new Error(message);
  }
}
// UPLOAD DEPOSIT RECEIPT
export async function uploadDepositReceipt(formData) {
  try {
    const response = await Request.post(
      'comprobantes/depositos/subirCaptura',
      formData,
      false,
    );
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }

    return response.data.data.url || '';
  } catch (error) {
    throw new Error(error.message);
  }
}
// SAVE DEPOPSIT RECEIPT
export async function saveDepositReceipt(imageUrl) {
  try {
    const user = Storage.getUser()
      ? Storage.getUser()
      : Storage.getItem('tempUser', true);
    const timestamp = await getServerTimestamp();

    await Database.save(DATABASE_TABLES.VOUCHERS, {
      numeroUsuario: user.usuario,
      capturaUrl: imageUrl,
      fecha: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    });

    const savedCapture = await Database.getItem(
      DATABASE_TABLES.VOUCHERS,
      'capturaUrl',
      imageUrl,
    );

    return savedCapture;
  } catch (error) {
    throw new Error(error.message);
  }
}
