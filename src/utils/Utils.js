import ENV from 'react-native-config';
import {Moment, Money, Storage} from '.';

const {lt} = require('semver');

const Utils = {
  // VERIFICAR SI TIENE LA ULTIMA VERSION INSTALADA
  hasLastVersion: (deviceVersion, serverVersion) => {
    // IF DEVICE VERSION IS LESS THAN THE SERVER VERSION
    if (lt(deviceVersion, serverVersion)) {
      return false;
    }
    // IF DEVICE VERSION IS SAME OR GRATER TO THE SERVER VERSION
    return true;
  },
  // GET PREVIOUS WEEK PERIOD FROM A GIVEN CURRENT PERIOD
  getPreviousWeekPeriod: function (currentPeriod) {
    const previousWeekPeriod = {
      start: '',
      end: Moment(currentPeriod.start).subtract(1, 'days').format('YYYY-MM-DD'),
    };
    let counter = 0;
    while (
      Moment(previousWeekPeriod.end)
        .subtract(counter, 'days')
        .format('dddd')
        .toLowerCase() !== 'lunes'
    ) {
      counter++;
    }
    previousWeekPeriod.start = Moment(previousWeekPeriod.end)
      .subtract(counter, 'days')
      .format('YYYY-MM-DD');
    return previousWeekPeriod;
  },
  // GENERATE TICKET ID
  generateTicketId: function () {
    let usuario = Storage.getItem('usuario', true);
    let randomID = Utils.generarID();
    let numeroBoleto = Utils.separateId(usuario.usuario.concat(randomID));
    return numeroBoleto;
  },
  //GENERATE ID
  generarID: () => {
    let time = new Date().getTime();
    let strNumber = Math.floor(Math.random() * time).toString();
    let arrayNumber = strNumber.split('');
    let shuffledNumber = Utils.shuffleArray(arrayNumber).join('');
    let randomNumber = shuffledNumber.slice(0, 7);
    return randomNumber;
  },
  // SHUFFLE ARRAY ITEMS
  shuffleArray: array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  },
  //SEPARETE ID INTO 3 PARTS 123-456-789
  separateId: function (id) {
    let separate = id.toString().match(/\d{1,4}/g);
    let output = separate.join('-');
    return output;
  },
  // COMISION VENTA DE TICKET
  totalWithoutCommissionTicket(totalApostado) {
    const comision = totalApostado * 0.1;
    return totalApostado - comision;
    // return totalApostado;
  },
  //   OBTENER EL NOMBRE DEL SORTEO
  getDrawName(codigoSorteo) {
    let lista = {
      SZOD: 'Zod.',
      SMAY: 'May.',
      SSUP: 'Sup.',
      SESP: 'Esp.',
      GN: 'GNav.',
      SGOR: 'GNav.',
      SGES: 'GEsp.',
      SMAG: 'Mag.',
    };

    return lista[codigoSorteo] || '';
  },
  // CREATE TICKET TABLE BET HEADER DEPEND ON THE NUMBER OF PLACES
  createTicketTableBetHeader(numPlaces) {
    // [R]Numero[R]1er[R]2do[R]3er
    let str = '[R]#';
    // JUST ONE PLACE
    if (numPlaces === 1) {
      str += '[R]P';
    }
    // TWO PLACES
    if (numPlaces === 2) {
      str += '[R]P[R]S';
    }
    // THREE PLACES
    if (numPlaces === 3) {
      str += '[R]P[R]S[R]T';
    }
    return str;
  },
  // CREATE TICKET TABLE BET ROW
  createTicketTableBetRow(bet) {
    // [R]<font size='tall'>111<font>\n
    let row = `[R]<font size='normal'>${bet.numero}<font>`;
    bet.lugares.forEach(cantidad => {
      let el =
        cantidad.toString() == '0' || cantidad.toString() == ''
          ? 'X'
          : cantidad;
      row += `[R]<font size='normal'>${el}<font>`;
    });
    return row + '\n';
  },
  // ACORTA EL ID DE UN TICKET
  shortenID(id) {
    // XXXX-XXXX-XXXX
    let idArr = id.split('-');
    idArr.pop();
    // XXXX-XXXX
    return idArr.join('-');
  },
  // CREATE TOTAL ACCUMULATED TABLE ROW
  createTotalAccumulatedTableRow(record) {
    const TEXTO_TOTAL_APOSTADO = {
      boleto: record.total.toString(),
      cancelado: record.total.toString() + '(C)',
      pago: record.total.toString() + '(P)',
    };
    return `[R]<font>${Utils.shortenID(
      record.numeroBoleto,
    )}<font>[R]<font>${record.hora.toString()}<font><font>[R]<font>${
      TEXTO_TOTAL_APOSTADO[record.tipo]
    }<font>\n`;
  },
  // SUM VALUES BY INDEX
  sumValuesByIndex(arr1, arr2) {
    let results = [];
    for (let i = 0; i < arr1.length; i++) {
      results[i] = (parseInt(arr1[i]) + parseInt(arr2[i])).toString();
    }
    return results;
  },
  // CONVERT DATE TO DAY LOWER CASE
  dateToDayLowerCase: function (date) {
    return Moment(date).format('dddd').toLowerCase();
  },
  // CALCULATE TICKETS TOTAL SALE COMISION
  ticketsSaleComision: function (totalSale) {
    if (totalSale > 10000) return totalSale * 0.15;
    if (totalSale > 5001) return totalSale * 0.12;
    return totalSale * 0.1;
  },
  // CALCULATE TRANSACTIONS SALE
  calculateTransactionsSale: function (transactions, categoryId) {
    const filtered = transactions.filter(txn => txn.CategoriaID == categoryId);
    let totalSale = 0;
    // ITERAR TRANSACCIONES FILTRADAS
    for (let i = 0; i < filtered.length; i++) {
      const txn = filtered[i];
      // SI ES RECARGA | PAQUETE
      if (['1', '2'].includes(categoryId)) {
        // const ventaMasComision =
        //   parseFloat(Money(txn.Monto, false, true)) +
        //   parseFloat(Money(txn.Comision, false, true));
        const sale = parseFloat(Money(txn.Monto, false, true));
        totalSale += sale;
      }
      // SI ES SERVICIO | GIFTCARD
      if (['3', '4'].includes(categoryId)) {
        const comisionAdmin =
          parseFloat(Money(txn.Comision, false, true)) * 0.5;
        const serviceCommission =
          parseFloat(Money(txn.Comision, false, true)) * 0.5;
        const cargoMasComision =
          parseFloat(Money(txn.Cargo, false, true)) +
          parseFloat(Money(txn.Comision, false, true));
        const result =
          parseFloat(Money(txn.Monto, false, true)) +
          (parseFloat(cargoMasComision) - parseFloat(serviceCommission));
        totalSale += result + comisionAdmin;
      }
    }
    return {
      total: totalSale,
      recordsFound: parseInt(filtered.length),
    };
  },
  // CALCULATE AIRTIME COMISION
  calculateTransactionsCommission(transactions = [], categoryId) {
    const filtered = transactions.filter(t => t.CategoriaID === categoryId);
    let totalCommission = 0;
    for (let i = 0; i < filtered.length; i++) {
      const txn = filtered[i];
      // RECARGA | PAQUETE
      if (['1', '2'].includes(categoryId)) {
        const commissionOnRecharge =
          parseFloat(Money(txn.Monto, false, true)) * 0.04;
        // const rechargeCommission =
        //   parseFloat(Money(txn.Cargo, false, true)) +
        //   parseFloat(Money(txn.Comision, false, true));
        // const sumaComisiones =
        //   parseFloat(Money(commissionOnRecharge, false, true)) +
        //   parseFloat(Money(rechargeCommission, false, true));
        totalCommission += commissionOnRecharge;
      }
      // SERVICIO
      if (categoryId === '3') {
        const serviceCommission =
          parseFloat(Money(txn.Comision, false, true)) * 0.5;
        totalCommission += serviceCommission;
      }
      // GIFTCARD
      if (categoryId === '4') {
        const giftCardPayout = parseFloat(Money(txn.Abono, false, true)) * 0.5;
        const serviceCommission =
          parseFloat(Money(txn.Comision, false, true)) * 0.5;
        totalCommission += serviceCommission + giftCardPayout;
      }
    }
    return totalCommission;
  },
  // CALCULATE COMMISSION CHARGED TO CLIENT
  calculateCommissionChargedToClient: function (transactions = []) {
    const filtered = transactions.filter(txn =>
      ['1', '2'].includes(txn.CategoriaID),
    );
    let total = 0;
    filtered.forEach(txn => {
      const commission =
        txn._comisionRecargas !== undefined ? txn._comisionRecargas : Money(2);
      total += Utils.dollarToFloatNumber(commission);
    });
    return total;
  },
  // REMOVE DOLLAR SIGN AND CONVER VALUE TO FLOAT NUMBER
  dollarToFloatNumber: function (valueWithDollarSign = '') {
    // IF DOLLAR SIGN IS NOT FOUND
    if (valueWithDollarSign.indexOf('$') === -1) return valueWithDollarSign;
    // IF DOLLAR SIGN IS FOUND
    return parseFloat(valueWithDollarSign.replace('$', ''));
  },
  // REDUCE OBJECT LIST
  sumObjListByProp: function (list, propName) {
    return list.reduce((acc, item) => acc + parseFloat(item[propName]), 0);
  },
  // ROUND UP DECIMALS
  roundDecimals: function (floatNumber) {
    return Math.round(floatNumber * 100) / 100;
  },
  // GET PAST DAY BY NAME
  getPastDateByDayName: function (timestamp, dayName) {
    let counter =
      Moment(timestamp).subtract(0, 'days').format('dddd').toLowerCase() ===
      dayName
        ? 1
        : 0;
    while (
      Moment(timestamp)
        .subtract(counter, 'days')
        .format('dddd')
        .toLowerCase() !== dayName
    ) {
      counter++;
    }
    return Moment(timestamp).subtract(counter, 'days').format('YYYY-MM-DD');
  },
  // CONVERT PERIOD OBJECT TO LONG TEXT
  periodToLongText: function (period) {
    // DATES ARE EQUALS
    if (Moment(period.start).isSame(Moment(period.end))) {
      return `${Moment(period.start).format(
        'dddd DD MMMM YYYY',
      )}`.toUpperCase();
    }
    return `DEL ${Moment(period.start).format('dddd DD')} AL ${Moment(
      period.end,
    ).format('dddd DD MMMM YYYY')}`.toUpperCase();
  },
  // GENERATE RANDOM NUMBER
  generateRandomNumber: function (numLength = 4) {
    let str = '';
    for (let i = 0; i < numLength; i++) {
      const n = Math.floor(Math.random() * 9);
      str += n.toString();
    }
    return str;
  },
  // GET WEEK PERIOD
  getWeekPeriod: function (timestamp, periodo) {
    const dias = 'domingo.lunes.martes.miercoles.jueves.viernes.sabado'.split(
      '.',
    );
    if (periodo === 'hoy') {
      let numDias = 0;
      // RESTAMOS 1 DIA HASTA LLEGAR AL LUNES
      while (
        Moment(timestamp).subtract(numDias, 'days').format('dddd') !== 'lunes'
      ) {
        numDias++;
      }
      return {
        start: Moment(timestamp).subtract(numDias, 'days').format('YYYY-MM-DD'),
        end: Moment(timestamp).format('YYYY-MM-DD'),
      };
    }
    // SI EL DIA SELECCIONADO ES IGUAL AL DIA DE HOY (SINGNIFICA QUE ES DE LA SEMANA PASADA)
    if (dias.includes(periodo)) {
      let numDias =
        Moment(timestamp).subtract(0, 'days').format('dddd') === periodo
          ? 1
          : 0;
      // BUSCAMOS LA FECHA SELECCIONADA
      while (
        Moment(timestamp).subtract(numDias, 'days').format('dddd') !== periodo
      ) {
        numDias++;
      }
      const fechaSeleccionada = Moment(timestamp)
        .subtract(numDias, 'days')
        .format('YYYY-MM-DD');
      // RESETEAMOS CONTADOR DIAS
      numDias = 0;
      // BUSCAMOS LA FECHA INICIAL
      while (
        Moment(fechaSeleccionada).subtract(numDias, 'days').format('dddd') !==
        'lunes'
      ) {
        numDias++;
      }
      const fechaInicial = Moment(fechaSeleccionada)
        .subtract(numDias, 'days')
        .format('YYYY-MM-DD');
      // RESETEAMOS CONTADOR DIAS
      numDias = 0;
      // BUSCAMOS LA FECHA FINAL
      while (
        Moment(fechaSeleccionada).add(numDias, 'days').format('dddd') !==
        'domingo'
      ) {
        numDias++;
      }
      const fechaFinal = Moment(fechaSeleccionada)
        .add(numDias, 'days')
        .format('YYYY-MM-DD');
      return {
        start: fechaInicial,
        end: fechaFinal,
      };
    }
  },
  // SORT LIST BY DATE
  sortListByDate: function (list = [], prop1, prop2) {
    if (prop1 !== undefined && prop2 === undefined) {
      return list.sort(
        (a, b) => Moment(b[prop1]).valueOf() - Moment(a[prop1]).valueOf(),
      );
    }
    if (prop1 !== undefined && prop2 !== undefined) {
      return list.sort(
        (a, b) =>
          Moment(b[prop1] + ' ' + b[prop2]).valueOf() -
          Moment(a[prop1] + ' ' + a[prop2]).valueOf(),
      );
    }
  },
  // SET LOGIN TIME TO TRACK INABILITY TIME
  setLoginTime: function () {
    Storage.setItem('loginTime', Moment().format('YYYY-MM-DD HH:mm:ss'));
  },
  // REMOVE LOGIN TIME
  removeLoginTime: function () {
    Storage.removeItem('loginTime');
  },
  // CHECK SESSION TIME LAPSED
  hasSessionExpired: function () {
    const loginTime = Storage.getItem('loginTime');
    if (loginTime == null) return true;
    const _loginTime = Moment(loginTime).format('YYYY-MM-DD');
    const _currentTime = Moment().format('YYYY-MM-DD');
    return Moment(_loginTime).isBefore(_currentTime);
    // return (
    //   currentTimeMoment.diff(Moment(loginTime), 'minutes') >= NO_ACTIVITY_TIME
    // );
  },
  // OBTENER KEY Y NIP DE TAECEL
  getTokens: () => {
    const usuario = Storage.getItem('usuario', true);
    // RETORNAR NULL SI NO EXISTE
    if (!usuario) return null;

    return {key: ENV.TAECEL_KEY, nip: ENV.TAECEL_NIP};
  },
  generateHashes: function (n = 10) {
    let hashes = '';
    for (let i = 0; i < n; i++) {
      hashes += '#';
    }
    return hashes;
  },
  generateLineSeparator: function (n = 0, separator = '#') {
    let lineSeparator = '';
    for (let i = 0; i < n; i++) {
      lineSeparator += separator;
    }
    return lineSeparator;
  },
  //   OBTENER EL NOMBRE DEL SORTEO
  obtenerNombreSorteo: function (codigoSorteo) {
    let lista = {
      SZOD: 'Zod.',
      SMAY: 'May.',
      SSUP: 'Sup.',
      SESP: 'Esp.',
      GN: 'GNav.',
      SGOR: 'GNav.',
      SGES: 'GEsp.',
      SMAG: 'Mag.',
    };

    return lista[codigoSorteo] || '';
  },
  // PADD NUMBER LEFT
  paddedNumber: function (n, paddChar = '0') {
    return String(n).padStart(3, paddChar);
  },
  // FILTER BY VALUE
  filterByValue(array, value) {
    return array.filter(
      data =>
        JSON.stringify(data).toLowerCase().indexOf(value.toLowerCase()) !== -1,
    );
  },
  // GENERA TODAS LAS COMBINACIONES POSIBLES DE UN NUMERO DADO
  permutations(number) {
    // Convertir el número a una cadena y dividirlo en un array de dígitos
    const digits = String(number).split('');

    if (digits.length !== 3) {
      throw new Error('El número debe tener exactamente 3 cifras.');
    }

    const combinations = new Set();

    // Generar todas las combinaciones posibles
    for (let i = 0; i < digits.length; i++) {
      for (let j = 0; j < digits.length; j++) {
        for (let k = 0; k < digits.length; k++) {
          if (i !== j && i !== k && j !== k) {
            combinations.add(digits[i] + digits[j] + digits[k]);
          }
        }
      }
    }

    return [...combinations];
  },
};

export default Utils;
