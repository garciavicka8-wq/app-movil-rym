import {
  getCanceledTicketsFromRange,
  getDepositsByReference,
  getPaidPayoutsFromRange,
  getPaidPrizesFromRange,
  getPastDueBalances,
  getTicketsFromRange,
  getTimestamp,
  getTransactionsFromRange,
} from '../../../../database/facade';
import {
  getPeriodFromMonday,
  getUserWeekInform,
  saveUserWeekInform,
} from '../../../../services/common';
import FinanzasService from '../../../../services/FinanzasService';
import {Moment, Utils} from '../../../../utils';
// CALCULATES THE USER SELLS AND COMMISSIONS AND RETURNS AN OBJECT
// WITH ALL THE INFORMATION
// @param period Object = {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD}
export async function getUserAccountStatus(period, user) {
  try {
    const timestamp = await getTimestamp();
    const weekReport = await generateWeekReport(period);
    const weekInform = await createUserWeekInform(
      weekReport,
      user.id,
      user.usuario,
    );
    const prevPeriod = Utils.getPreviousWeekPeriod(period);
    const addDaysToDate = days =>
      Moment(period.end).add(days, 'days').format('YYYY-MM-DD');
    const nextPaidPrizes = await getPaidPrizesFromRange(
      addDaysToDate(1), // Lunes
      addDaysToDate(3), // Miercoles
    );
    const {numberUserNextPaidPrizes, totalUserNextPaidPrizes} =
      FinanzasService.calculateUserNextPaidPrizes(nextPaidPrizes, user.usuario);
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
      const dateTimeFormated = Moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
      const weekAmount =
        lastInform.dueBalance +
        weekInform.amount -
        weekInform.paidPrizesBeforeWeekPaymentLimitDay.total;
      const userInform = {
        id: uuid(),
        user: user.usuario,
        period: period.start + ':' + period.end,
        reference,
        totalDeposits: Utils.roundDecimals(weekInform.deposits.total),
        numDeposits: weekInform.deposits.recordsFound,
        amount: Utils.roundDecimals(weekAmount),
        dueBalance: Utils.roundDecimals(weekAmount - weekInform.deposits.total),
        created: dateTimeFormated,
        modified: dateTimeFormated,
        paymentCompleted: false,
      };

      await saveUserWeekInform(userInform);
    }

    const toPay =
      lastInform.dueBalance +
      weekInform.amount -
      weekInform.paidPrizesBeforeWeekPaymentLimitDay.total;

    const amount =
      lastInform.dueBalance +
      weekInform.amount -
      weekInform.paidPrizesBeforeWeekPaymentLimitDay.total -
      totalUserNextPaidPrizes;

    const dueBalance =
      lastInform.dueBalance -
      weekInform.paidPrizesBeforeWeekPaymentLimitDay.total;

    return {
      ...weekInform,
      toPay,
      amount,
      lastInformPeriodEnd: prevPeriod,
      lastInformAmount: lastInform.amount,
      lastInformTotalDeposits: lastInform.totalDeposits,
      dueBalance,
      nomComercial: user.nomComercial,
      nextPaidPrizesBeforeWeekPaymentLimitDayTotal: totalUserNextPaidPrizes,
      nextPaidPrizesBeforeWeekPaymentLimitDayRecordsFound:
        numberUserNextPaidPrizes,
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
      const serverTimestamp = await getTimestamp();
      _period = getPeriodFromMonday(serverTimestamp);
    }
    const tickets = await getTicketsFromRange(_period.start, _period.end);
    const transactions = await getTransactionsFromRange(
      _period.start,
      _period.end,
    );
    const paidPrizes = await getPaidPrizesFromRange(_period.start, _period.end);
    const payouts = await getPaidPayoutsFromRange(_period.start, _period.end);
    const deposits = await getDepositsByReference(
      _period.start + ':' + _period.end,
    );
    const canceledTickets = await getCanceledTicketsFromRange(
      _period.start,
      _period.end,
    );
    const pastDueBalances = await getPastDueBalances();

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
export async function createUserWeekInform(weekReport, userId, userNumber) {
  try {
    const userWeekReport = getUserWeekReport(weekReport, userId, userNumber);
    const {period} = userWeekReport;
    // SELLS
    const ticketsTotalSale = FinanzasService.calcularTicketsTotal(
      userWeekReport.tickets,
    );
    const totalPaidPrizes = FinanzasService.calcularTotal(
      userWeekReport.paidPrizes,
      'premio',
    );
    const premiosDivididos = FinanzasService.dividirPremiosPorCorte(
      userWeekReport.paidPrizes,
    );
    const {airTime, packages, paidServices, giftcards, rechargeTotalSale} =
      FinanzasService.calculateTransactionsSales(userWeekReport.transactions);
    const commissionChargedToClient =
      FinanzasService.calculateCommissionChargedToClient(
        userWeekReport.transactions,
        period,
      );
    // TOTAL SALES
    const totalSalesSum =
      ticketsTotalSale +
      rechargeTotalSale +
      paidServices.total +
      giftcards.total +
      commissionChargedToClient;
    // COMMISSIONS
    const ticketsCommission =
      FinanzasService.ticketsSaleComision(ticketsTotalSale);
    const {
      airTimeCommission,
      packagesCommission,
      paidServicesCommission,
      giftCardsCommission,
    } = FinanzasService.calculateTransactionsCommissions(
      userWeekReport.transactions,
    );

    let paidPrizes = premiosDivididos.totalDespues;
    if (FinanzasService.periodoExentoDeComision(period)) {
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
    const totalPayouts = FinanzasService.sumPropertyInList(
      userWeekReport.payouts,
      'cantidad',
    );
    const totalRefunds = FinanzasService.sumPropertyInList(
      userWeekReport.refunds,
      'cantidad',
    );
    const totalAdjustments = FinanzasService.sumPropertyInList(
      userWeekReport.adjustments,
      'cantidad',
    );
    const totalPrizesAndCommissionsWithoutPayouts =
      totalCommissionsSum - totalPayouts - (totalRefunds + totalAdjustments);
    const amount = totalSalesSum - totalPrizesAndCommissionsWithoutPayouts;
    const cash =
      totalSalesSum +
      (totalPayouts - totalPaidPrizes) +
      commissionChargedToClient;
    // USER WEEK INFORM
    return {
      period: weekReport.period,
      user: userNumber,
      totalSalesSum,
      totalCommissionsSum,
      commissionChargedToClient,
      totalPrizesAndCommissionsWithoutPayouts,
      amount,
      cash,
      tickets: {
        total: ticketsTotalSale,
        recordsFound: userWeekReport.tickets.length,
        commission: ticketsCommission,
      },
      canceledTickets: {
        total: FinanzasService.sumPropertyInList(
          userWeekReport.canceledTickets,
          'reembolso',
        ),
        recordsFound: userWeekReport.canceledTickets.length,
      },
      paidPrizes: {
        total: totalPaidPrizes,
        recordsFound: paidPrizes.length,
      },
      paidPrizesBeforeWeekPaymentLimitDay: {
        total: premiosDivididos.totalAntes,
        recordsFound: premiosDivididos.antes.length,
        commission: 0,
      },
      paidPrizesAfterWeekPaymentLimitDay: {
        total: premiosDivididos.totalDespues,
        recordsFound: premiosDivididos.despues.length,
        commission: 0,
      },
      recharges: {
        total: rechargeTotalSale,
        recordsFound: airTime.recordsFound + packages.recordsFound,
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
      refunds: {
        total: totalRefunds,
        recordsFound: userWeekReport.refunds.length,
      },
      adjustments: {
        total: totalAdjustments,
        recordsFound: userWeekReport.adjustments.length,
      },
      deposits: {
        total: FinanzasService.sumPropertyInList(
          userWeekReport.deposits,
          'pago',
        ),
        recordsFound: userWeekReport.deposits.length,
        list: userWeekReport.deposits,
      },
    };
  } catch (error) {
    console.error('Error en createUserWeekInform:', error.message);
    throw new Error(error.message);
  }
}
// RETURNS A USER ACOUNT STATUS FROM A GIVEN WEEK REPORT
export function getUserWeekReport(weekReport, userId, userNumber) {
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

  const byUserNumber = field => Utils.byFieldEquals(field, userNumber);
  const byUserIdAndTipo = tipo =>
    Utils.byTwoFields('agenciaId', userId, 'tipo', tipo);

  return {
    period,
    adjustments: payouts.filter(byUserIdAndTipo('ajuste')),
    payouts: payouts.filter(byUserIdAndTipo('abono')),
    paidPrizesPayouts: payouts.filter(byUserIdAndTipo('pago-premios')),
    refunds: payouts.filter(byUserIdAndTipo('reembolso')),
    canceledTickets: canceledTickets.filter(byUserNumber('agencia')),
    deposits: deposits.filter(byUserNumber('usuario')),
    paidPrizes: paidPrizes.filter(byUserNumber('pagadoPor')),
    pastDueBalances: pastDueBalances.filter(byUserNumber('usuario')),
    tickets: tickets.filter(byUserNumber('numeroAgencia')),
    transactions: transactions.filter(byUserNumber('_usuario')),
  };
}
