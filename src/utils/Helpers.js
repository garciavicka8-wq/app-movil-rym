import {Moment, Money} from '.';
import {RYM_LOGOS_URL, TXN} from '../constants';

const Helpers = {
  // DECRIPCION PRODUCTO TRANSACCIONES
  descripcionProductoTransaccion(producto) {
    // SI ES RECARGA | PAQUETE
    if ([TXN.CODES.RECARGA, TXN.CODES.PAQUETE].includes(producto.CategoriaID)) {
      return producto.Descripcion;
    }
    // SI ES SERVICIO
    if (producto.CategoriaID == TXN.CODES.SERVICIO) {
      return 'Tiene 5 dias naturales para solicitar aclaraciones sobre el cobro de su recibo, despues de esta fecha no nos responsabilizamos por sus pagos.**Una vez procesado el pago ya no habra reembolsos ni devoluciones. RECARGAS y MAS no se responsabiliza por cargos de reconexion o multas.';
    }
    // SI ES GIFT CARD
    if (producto.CategoriaID == TXN.CODES.GIFTCARD) {
      return producto.Vigencia;
    }
    // SI NADA COINCIDE
    return '';
  },
  // CALCULAR TRANSACCION
  calcularTotalTransaccion: (txn, categoriaID) => {
    const monto = parseFloat(Helpers.toMoneyWithDecimals(txn.Monto, false));

    if ([TXN.CODES.RECARGA, TXN.CODES.PAQUETE].includes(categoriaID)) {
      // Calcular total para RECARGA o PAQUETE
      const comisionSobreRecarga = monto * 0.04;
      return monto - comisionSobreRecarga;
    }

    if ([TXN.CODES.SERVICIO, TXN.CODES.GIFTCARD].includes(categoriaID)) {
      // Calcular total para SERVICIO o GIFTCARD
      const comision =
        parseFloat(Helpers.toMoneyWithDecimals(txn.Comision, false)) / 2;
      const cargoMasComision = Helpers.sumWithDecimals(
        txn.Cargo,
        comision,
        false,
      );
      return monto + parseFloat(cargoMasComision);
    }

    return 0; // Valor por defecto si no coincide con ninguna categoría
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
    const url = RYM_LOGOS_URL + src + '.png';
    return url;
  },
};

export default Helpers;
