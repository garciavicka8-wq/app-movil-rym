import {Moment, Money} from '.';
import {LOGOS_URL} from '../constants';

const Helpers = {
  // DECRIPCION PRODUCTO TRANSACCIONES
  descripcionProductoTransaccion(producto) {
    // SI ES RECARGA | PAQUETE
    if (['1', '2'].includes(producto.CategoriaID)) {
      return producto.Descripcion;
    }
    // SI ES SERVICIO
    if (producto.CategoriaID == '3') {
      return 'Tiene 5 dias naturales para solicitar aclaraciones sobre el cobro de su recibo, despues de esta fecha no nos responsabilizamos por sus pagos.**Una vez procesado el pago ya no habra reembolsos ni devoluciones. RECARGAS y MAS no se responsabiliza por cargos de reconexion o multas.';
    }
    // SI ES GIFT CARD
    if (producto.CategoriaID == '4') {
      return producto.Vigencia;
    }
    // SI NADA COINCIDE
    return '';
  },
  // CALCULAR TRANSACCION
  calcularTotalTransaccion: (transaccion, categoriaID) => {
    let ventaTransaccion = 0;
    // SI ES RECARGA | PAQUETE | GIFTCARD
    if (['1', '2'].includes(categoriaID)) {
      // const comision =
      //   transaccion._comisionRecargas !== undefined
      //     ? transaccion._comisionRecargas
      //     : Money(2);
      const comisionSobreRecarga =
        parseFloat(Helpers.toMoneyWithDecimals(transaccion.Monto, false)) *
        0.04;
      ventaTransaccion =
        parseFloat(Helpers.toMoneyWithDecimals(transaccion.Monto, false)) -
        parseFloat(comisionSobreRecarga);
      // ventaTransaccion = parseFloat(
      //   Helpers.toMoneyWithDecimals(transaccion.Monto, false),
      // );
    }
    // SI ES SERVICIO
    if (['3', '4'].includes(categoriaID)) {
      const txnComision =
        parseFloat(Helpers.toMoneyWithDecimals(transaccion.Comision, false)) /
        2;
      const cargoMasComision = Helpers.sumWithDecimals(
        transaccion.Cargo,
        txnComision,
        false,
      );
      const resultado =
        parseFloat(Helpers.toMoneyWithDecimals(transaccion.Monto, false)) +
        parseFloat(cargoMasComision);
      ventaTransaccion = parseFloat(resultado);
    }
    return ventaTransaccion;
  },
  //   COVIERTE UNA CADENA A FORMATO DECIMAL
  toMoneyWithDecimals: (amount, withSimbol = true, number = false) => {
    return Money(amount, withSimbol, number);
  },
  //   CONVIERTE CADENAS DE TEXTO A DECIMALES Y LOS SUMA
  sumWithDecimals: (a, b, withSimbol = true) => {
    // console.log(a);
    if (a === undefined || b === undefined) return '0.00';
    let num1 = a.toString().replace(/[$,]/g, '');
    let num2 = b.toString().replace(/[$,]/g, '');
    let sum = parseFloat(num1) + parseFloat(num2);
    return Money(sum, withSimbol);
  },
  // SUM ARRAY
  sumArrayWithDecimals: (arr = []) => {
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i];
      let num = el.replace(/[$,]/g, '');
      total = parseFloat(total) + parseFloat(num);
    }
    return Money(total);
  },
  // ORDENAR ELEMENTOS
  ordenarElementos(list, func) {
    return list.sort(func);
  },
  // GET FIRST CHAR
  obtenerPrimerCaracter(str) {
    return str.charAt(0);
  },
  // ORDENAR LISTA POR FECHA
  sortListByDate: function (list = [], orderBy, orderWay = 'desc') {
    if (orderWay === 'desc') {
      return list.sort(
        (a, b) => Moment(b[orderBy]).valueOf() - Moment(a[orderBy]).valueOf(),
      );
    }
    if (orderWay === 'asc') {
      return list.sort(
        (a, b) => Moment(a[orderBy]).valueOf() - Moment(b[orderBy]).valueOf(),
      );
    }

    return list;
  },
  // CREAR URL PARA LOGOS
  urlImage: imageName => {
    const src = imageName === 'GN' ? 'SGOR' : imageName;
    return LOGOS_URL + src + '.png';
  },
};

export default Helpers;
