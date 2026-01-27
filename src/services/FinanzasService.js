import {Moment, Money, Utils} from '../utils';

export default class FinanzasService {
  static money(value) {
    return parseFloat(Money(value, false, true));
  }

  static calcularTotal(array, prop) {
    return array.reduce((acc, item) => acc + parseFloat(item[prop] || 0), 0);
  }

  static calcularTicketsTotal(tickets) {
    return tickets.reduce((acc, el) => acc + parseInt(el.totalApostado), 0);
  }

  static dividirPremiosPorCorte(premios) {
    const diasAntes = ['lunes', 'martes', 'miercoles'];
    const diasDespues = ['jueves', 'viernes', 'sabado', 'domingo'];

    const antes = premios.filter(p =>
      diasAntes.includes(Utils.dateToDayLowerCase(p.fechaPago)),
    );
    const despues = premios.filter(p =>
      diasDespues.includes(Utils.dateToDayLowerCase(p.fechaPago)),
    );

    return {
      antes,
      despues,
      totalAntes: FinanzasService.calcularTotal(antes, 'premio'),
      totalDespues: FinanzasService.calcularTotal(despues, 'premio'),
    };
  }

  static periodoExentoDeComision(period) {
    return (
      Moment(period.start).isSameOrBefore('2023-08-28') &&
      Moment(period.end).isSameOrBefore('2023-09-03')
    );
  }

  static calculateTransactionsSales(transactions) {
    const CATEGORIAS_IDS = ['1', '2', '3', '4'];
    const categoryNames = {
      1: 'airTime',
      2: 'packages',
      3: 'paidServices',
      4: 'giftcards',
    };
    const categories = {
      airTime: {total: 0, recordsFound: 0},
      packages: {total: 0, recordsFound: 0},
      paidServices: {total: 0, recordsFound: 0},
      giftcards: {total: 0, recordsFound: 0},
      rechargeTotalSale: 0,
    };

    for (const categoryId of CATEGORIAS_IDS) {
      const filtered = transactions.filter(
        txn => txn.CategoriaID == categoryId,
      );
      let totalSale = 0;
      // ITERAR TRANSACCIONES FILTRADAS
      for (const txn of filtered) {
        // SI ES RECARGA | PAQUETE
        if (['1', '2'].includes(categoryId)) {
          totalSale += FinanzasService.money(txn.Monto);
        }
        // SI ES SERVICIO | GIFTCARD
        if (['3', '4'].includes(categoryId)) {
          const comisionAdmin = FinanzasService.money(txn.Comision) * 0.5;
          const serviceCommission = FinanzasService.money(txn.Comision) * 0.5;
          const cargoMasComision =
            FinanzasService.money(txn.Cargo) +
            FinanzasService.money(txn.Comision);
          const result =
            FinanzasService.money(txn.Monto) +
            (parseFloat(cargoMasComision) - parseFloat(serviceCommission));
          totalSale += result + comisionAdmin;
        }
      }
      categories[categoryNames[categoryId]] = {
        total: totalSale,
        recordsFound: parseInt(filtered.length),
      };
    }

    categories.rechargeTotalSale =
      categories.airTime.total + categories.packages.total;

    return categories;
  }

  static calculateTransactionsCommissions(transactions = []) {
    const CATEGORIAS_IDS = ['1', '2', '3', '4'];
    const categoryNames = {
      1: 'airTimeCommission',
      2: 'packagesCommission',
      3: 'paidServicesCommission',
      4: 'giftCardsCommission',
    };
    const commissions = {
      airTimeCommission: 0,
      packagesCommission: 0,
      paidServicesCommission: 0,
      giftCardsCommission: 0,
    };

    for (const categoryId of CATEGORIAS_IDS) {
      const filtered = transactions.filter(t => t.CategoriaID === categoryId);
      let totalCommission = 0;
      for (const txn of filtered) {
        // RECARGA | PAQUETE
        if (['1', '2'].includes(categoryId)) {
          const commissionOnRecharge = FinanzasService.money(txn.Monto) * 0.04;
          totalCommission += commissionOnRecharge;
        }
        // SERVICIO
        if (categoryId === '3') {
          const serviceCommission = FinanzasService.money(txn.Comision) * 0.5;
          totalCommission += serviceCommission;
        }
        // GIFTCARD
        if (categoryId === '4') {
          const giftCardPayout =
            FinanzasService.money(txn.Abono, false, true) * 0.5;
          const serviceCommission = FinanzasService.money(txn.Comision) * 0.5;
          totalCommission += serviceCommission + giftCardPayout;
        }
      }
      commissions[categoryNames[categoryId]] = totalCommission;
    }

    return commissions;
  }

  static calculateCommissionChargedToClient(transactions = [], period) {
    if (FinanzasService.periodoExentoDeComision(period)) {
      return 0;
    }

    const filtered = transactions.filter(txn =>
      ['1', '2'].includes(txn.CategoriaID),
    );

    let total = 0;

    filtered.forEach(txn => {
      const commission =
        txn._comisionRecargas !== undefined ? txn._comisionRecargas : Money(2);
      total += FinanzasService.dollarToFloatNumber(commission);
    });

    return total;
  }

  static dollarToFloatNumber(value) {
    if (typeof value === 'number') return value; // Si ya es número, retornarlo directamente
    if (typeof value !== 'string') return 0; // Si no es string ni número, retornar 0

    const cleanValue = value.replace(/[$,]/g, ''); // Remueve $ y comas
    return parseFloat(cleanValue) || 0; // Convierte a número o retorna 0 si es inválido
  }

  static ticketsSaleComision(totalSale) {
    if (totalSale > 10000) return totalSale * 0.15;
    if (totalSale > 5001) return totalSale * 0.12;
    return totalSale * 0.1;
  }

  static sumPropertyInList(objectList = [], propName = '') {
    return objectList.reduce(
      (acc, item) => acc + parseFloat(item[propName]),
      0,
    );
  }

  static calculateUserNextPaidPrizes(nextPaidPrizes = [], userNumber = '') {
    const userNextPaidPrizes = nextPaidPrizes.filter(
      item => item.pagadoPor == userNumber,
    );
    const totalUserNextPaidPrizes = userNextPaidPrizes.reduce(
      (acc, item) => acc + parseFloat(item.premio),
      0,
    );

    return {
      userNextPaidPrizes,
      numberUserNextPaidPrizes: userNextPaidPrizes.length,
      totalUserNextPaidPrizes,
    };
  }
}
