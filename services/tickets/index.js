import Database from '../../database';
import {Helpers, Moment, Utils, uuid} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import {DATABASE_TABLES} from '../constants';
import {actualizarCredito} from '../credito';
import {verifyUserAccountStatus} from '../reports';

export const obtenerSorteos = async () => {
  try {
    await obtenerUsuarioDb();
    const sorteos = await Database.getItems(DATABASE_TABLES.DRAWS);
    const sorteosOpciones = await Database.getItems(DATABASE_TABLES.DRAWS_LIST);
    sorteos.forEach(s => {
      const opcion = sorteosOpciones.find(o => o.codigo === s.codigoSorteo);
      const numLugares = s.codigoSorteo === 'GN' ? 2 : opcion.numLugares;
      s.numLugares = numLugares;
    });
    return sorteos;
  } catch ({message}) {
    throw new Error(message);
  }
};
// OBTENER CREDITO DISPONIBLE
export async function obtenerCreditoDisponible() {
  try {
    const usuarioDB = await obtenerUsuarioDb();
    const creditoDisponible = await Database.getItem(
      DATABASE_TABLES.CREDITS,
      'usuario',
      usuarioDB.usuario,
    );
    return creditoDisponible.saldo;
  } catch ({message}) {
    throw new Error(message);
  }
}
// OBTENER PROXIMOS SORTEOS
export const obtenerProximosSorteos = async () => {
  try {
    const sorteos = await obtenerSorteos();
    const horaCierre = await Database.getObject(DATABASE_TABLES.CLOSING_TIME);
    const timestamp = await Database.getServerDate();
    const hora = {
      cierre: Moment(horaCierre.hora, 'HH:mm'),
      actual: Moment(timestamp).format('HH:mm'),
    };
    const fechaActual = Moment(timestamp).format('YYYY-MM-DD');
    let proximosSorteos = [];
    // OBTENEMOS LOS SORTEOS CON FECHA ACTUAL EN ADELANTE
    sorteos.forEach(s => {
      //   SI LA FECHA ES LA MISMA O POSTERIO'¿
      if (Moment(s.fecha).isSameOrAfter(fechaActual)) {
        proximosSorteos.push({...s, selected: false});
      }
    });
    // EXCLUIMOS EL SORTEO ACTUAL (EN CASO DE QUE YA SE HAYA JUGADO)
    proximosSorteos.forEach((s, index) => {
      // SI ES LA MISMA FECHA Y SI YA CERRO EL
      // SORTEO ENTONCES LO ELIMINAMOS
      if (
        Moment(s.fecha).isSame(fechaActual) &&
        Moment(hora.actual, 'HH:mm').isSameOrAfter(hora.cierre)
      ) {
        proximosSorteos.splice(index, 1);
      }
    });
    // ORDENAR SORTEOS
    const proximosSorteosOrdenados = Helpers.sortListByDate(
      proximosSorteos,
      'fecha',
      'asc',
    );
    // MARCAR PRIMER ELEMENTO COMO SELECCIONADO
    if (proximosSorteosOrdenados.length > 0) {
      proximosSorteosOrdenados[0].selected = true;
    }
    return [...proximosSorteosOrdenados];
  } catch ({message}) {
    throw new Error(message);
  }
};
// REGISTRAR TICKET
export const registrarTicket = async (
  sorteo,
  jugadas,
  creditoDisponible = 0,
  viaWhatsapp = false,
  numeroTelefono = '',
) => {
  try {
    // VERIFY IF USER STATUS IS UP TO DATE
    await verifyUserAccountStatus();
    // VERIFICAR VERSION DE APP
    const usuarioDb = await obtenerUsuarioDb();
    // SI EL USUARIO EXISTE Y ESTA ACTIVO
    const sorteoDb = await Database.getItem(
      DATABASE_TABLES.DRAWS,
      'id',
      sorteo.id,
    );
    // SI EL SORTEO NO EXISTE
    if (!sorteoDb) throw new Error('El sorteo que intentas jugar no existe');
    // SI EL SORTEO ESTA INACTIVO
    if (sorteoDb.activo !== undefined && !sorteoDb.activo)
      throw new Error('El sorteo que intentas jugar fue desactivado');
    // OBTENEMOS LA HORA DE CIERRE DEL SORTEO
    const horaCierre = await Database.getObject(DATABASE_TABLES.CLOSING_TIME);
    // OBTENEMOS LA FECHA DEL SERVIDOR
    const timestamp = await Database.getServerDate();
    const fecha = {
      servidor: timestamp,
      actual: Moment(timestamp).format('YYYY-MM-DD'),
      sorteo: sorteoDb.fecha,
    };
    const hora = {
      cierre: horaCierre.hora,
      actual: Moment(timestamp).format('HH:mm'),
    };
    // SI EL SORTEO SE CELEBRA HOY Y YA CERRO
    if (
      Moment(fecha.sorteo).isSame(fecha.actual) &&
      Moment(hora.actual, 'HH:mm').isSameOrAfter(Moment(hora.cierre, 'HH:mm'))
    ) {
      throw new Error('Lo sentimos, el sorteo ha cerrado');
    }
    // SI EL SORTEO YA SE CELEBRO
    if (Moment(fecha.actual).isAfter(fecha.sorteo)) {
      throw new Error('Lo sentimos, el sorteo seleccionado ya fue celebrado');
    }
    // OBTENER LOS BOLETOS DEL SORTEO SELECCIONADO
    const boletosRegistrados = await Database.getItemsByProp(
      DATABASE_TABLES.TICKETS,
      'fechaSorteo',
      sorteoDb.fecha,
    );
    // OBTENER LIMITE DE APUESTAS
    const limiteApuestas = await Database.getObject(DATABASE_TABLES.BET_LIMIT);
    // ESTRUCTURA DEL NUEVO BOLETO
    const newBoleto = {
      id: uuid(),
      tipo: 'ticket plus',
      numeroBoleto: Utils.generateTicketId(),
      numeroAgencia: usuarioDb.usuario,
      jugadas: jugadas,
      agenteId: usuarioDb.id,
      codigoSorteo: sorteoDb.codigoSorteo,
      fechaSorteo: sorteoDb.fecha,
      fechaExp: Moment(timestamp).format('YYYY-MM-DD'),
      horaImpresion: Moment(timestamp).format('HH:mm:ss'),
      totalApostado: jugadas.reduce(
        (acc, item) => acc + parseInt(item.totalApostado),
        0,
      ),
      via: viaWhatsapp ? 'whatsapp' : 'impresion',
      telefono: numeroTelefono,
    };
    // OBTENER NUMEROS SATURADOS
    const numerosSaturados = getSaturatedNumbers(
      newBoleto,
      boletosRegistrados,
      limiteApuestas,
    );
    let message = 'Números saturados: \n\n';
    numerosSaturados.saturados.forEach(saturado => {
      const _keys = Object.keys(saturado);
      const values = Object.values(saturado);
      const numero = _keys[0];
      let text_values = '';
      values.forEach(item => {
        const positions = Object.keys(item);
        const cantidades = Object.values(item);
        positions.forEach((position, i) => {
          const cantidad = cantidades[i] == '0' ? 'agotado' : cantidades[i];
          text_values += position + '°(' + cantidad + ') ';
        });
      });
      message += '[' + numero + ']' + ': ' + text_values + '\n';
    });
    // SI HAY NUMEROS SATURADOS
    if (numerosSaturados.saturados.length > 0) throw new Error(message);
    // SI LLEGO AL LIMITE DE VENTA PERMITIDO
    if (parseInt(creditoDisponible) <= 0)
      throw new Error('Limite de venta alcanzado.');
    // SI LLEGA AL LIMITE DE VENTA PERMITIDO AGREGANDO EL TOTAL DEL NUEVO BOLETO
    if (parseInt(creditoDisponible) - parseInt(newBoleto.totalApostado) < 0)
      throw new Error(
        `Con el total de este boleto se supera el limite semanal, por favor ajusta el total de puntos e intenta nuevamente.\n\nTotal boleto ${
          newBoleto.totalApostado
        }\nPuntos restantes ${Money(creditoDisponible, false)}`,
      );
    // SI NO HAY ERRORES GUARDAMOS EL BOLETO
    // console.log('el guardado esta desactivado, no olvidar reactivar');
    await Database.save(DATABASE_TABLES.TICKETS, newBoleto);
    // ACTUALIZAR CREDITO DISPONIBLE
    const credito = await Database.getItem(
      DATABASE_TABLES.CREDITS,
      'usuario',
      usuarioDb.usuario,
    );
    // VERIFICAMOS SI EXISTE EL CREDITO
    if (credito) {
      // RESTAMOS LA VENTA DEL BOLETO AL CREDITO DISPONIBLE
      const totalVentaBoleto = Utils.totalWithoutCommissionTicket(
        newBoleto.totalApostado,
      );
      const saldoNuevo = credito.saldo - totalVentaBoleto;
      // console.log('actualizar saldo esta desactivado, no olvidar reactivarlo');
      await actualizarCredito(saldoNuevo, credito.key);
      // console.log(saldoNuevo, totalVentaBoleto);
    }
    return newBoleto;
  } catch ({message}) {
    throw new Error(message);
  }
};
export async function registrarMagico({
  sorteo,
  numeroJugadas,
  cifras,
  numeroLugares,
  monto,
  creditoDisponible,
}) {
  try {
    // VERIFY IF USER ACCOUNT IS UP TO DATE
    await verifyUserAccountStatus();
    // VERIFICAR VERSION DE APP
    const usuarioDb = await obtenerUsuarioDb();
    // SI EL USUARIO EXISTE Y ESTA ACTIVO
    const sorteoDb = await Database.getItem(
      DATABASE_TABLES.DRAWS,
      'id',
      sorteo.id,
    );
    // SI EL SORTEO NO EXISTE
    if (!sorteoDb) throw new Error('El sorteo que intentas jugar no existe');
    // SI EL SORTEO ESTA INACTIVO
    if (sorteoDb.activo !== undefined && !sorteoDb.activo)
      throw new Error('El sorteo que intentas jugar fue desactivado');
    // OBTENEMOS LA HORA DE CIERRE DEL SORTEO
    const horaCierre = await Database.getObject(DATABASE_TABLES.CLOSING_TIME);
    // OBTENEMOS LA FECHA DEL SERVIDOR
    const timestamp = await Database.getServerDate();
    const fecha = {
      servidor: timestamp,
      actual: Moment(timestamp).format('YYYY-MM-DD'),
      sorteo: sorteoDb.fecha,
    };
    const hora = {
      cierre: horaCierre.hora,
      actual: Moment(timestamp).format('HH:mm'),
    };
    // SI EL SORTEO SE CELEBRA HOY Y YA CERRO
    if (
      Moment(fecha.sorteo).isSame(fecha.actual) &&
      Moment(hora.actual, 'HH:mm').isSameOrAfter(Moment(hora.cierre, 'HH:mm'))
    ) {
      throw new Error('Lo sentimos, el sorteo ha cerrado');
    }
    // SI EL SORTEO YA SE CELEBRO
    if (Moment(fecha.actual).isAfter(fecha.sorteo)) {
      throw new Error('Lo sentimos, el sorteo seleccionado ya fue celebrado');
    }
    // OBTENER LOS BOLETOS DEL SORTEO SELECCIONADO
    const boletos = await Database.getItemsByProp(
      DATABASE_TABLES.TICKETS,
      'fechaSorteo',
      sorteoDb.fecha,
    );
    // OBTENER LIMITE DE APUESTAS
    const limiteApuestas = await Database.getObject(DATABASE_TABLES.BET_LIMIT);
    // EXTRAER Y COMBINAR JUGADAS
    let jugadas = boletos.reduce((acc, item) => acc.concat(item.jugadas), []);
    // EXTAER LAS JUGADAS SEGUN LA CIFRAS SLECCIONADAS
    let numeros = {};
    jugadas.forEach(jugada => {
      if (jugada.numero.length === parseInt(cifras)) {
        // EXTRAER NUMEROS UNICOS Y SUMAR SUS LUGARES
        if (numeros[jugada.numero] === undefined) {
          numeros[jugada.numero] = jugada.lugares;
        } else {
          numeros[jugada.numero] = Utils.sumValuesByIndex(
            numeros[jugada.numero],
            jugada.lugares,
          );
        }
      }
    });
    // EXTRAER SOLO AQUELLOS NUMEROS QUE NO PASEN EL LIMITE DE APUESTA
    let numerosInJugables = [];
    const CIFRAS = {
      1: 'unaCifra',
      2: 'dosCifras',
      3: 'tresCifras',
    };
    const limite = limiteApuestas[CIFRAS[cifras]];
    for (const key in numeros) {
      if (Object.hasOwnProperty.call(numeros, key)) {
        const lugares = numeros[key];
        // COMPROBAR SI NO PASEN EL LIMITE DE APUESTA
        let sobrepasaLimite = false;
        lugares.forEach(cantidad => {
          const resultado = parseInt(cantidad) + parseInt(monto);
          if (resultado > limite) {
            sobrepasaLimite = true;
          }
        });
        // SI SOBREPASA EL LIMITE LO AGREGAMOS A LA LISTA DE INJUGABLES
        if (sobrepasaLimite) {
          numerosInJugables.push(key);
        }
      }
    }
    // ENCONTRAR NUMEROS DISPONIBNLES
    const TOTAL_NUMEROS = {
      1: 10,
      2: 100,
      3: 1000,
    };
    let numerosJugables = [];
    for (let i = 0; i < TOTAL_NUMEROS[cifras]; i++) {
      let numero = i;
      if (cifras == '2' && i < 10) {
        numero = '0' + i;
      }
      if (cifras == '3' && i < 10) {
        numero = '00' + i;
      }
      if (cifras == '3' && i >= 10 && i < 100) {
        numero = '0' + i;
      }
      if (!numerosInJugables.includes(numero.toString())) {
        numerosJugables.push(numero.toString());
      }
    }
    // SI NO HAY NUMEROS JUGABLES
    if (numerosJugables.length === 0)
      throw new Error(
        'Lo sentimos los números de ' +
          cifras +
          ' cifras se han agotado, intenta con otra cifra.',
      );
    let jugadasAleatorias = [];
    // GENERAR BOLETO MAGICO CON NUMEROS ALEATORIOS APARTIR DE LOS NUMEROS JUGABLES
    for (let i = 0; i < parseInt(numeroJugadas); i++) {
      const randomIndex = Math.floor(Math.random() * numerosJugables.length);
      const numeroAleatorio = numerosJugables[randomIndex];
      // SI YA NO SE ENCUENTRA NINGUN NUMERO SALIMOS DEL CICLO
      if (numeroAleatorio === undefined) break;
      // // QUITAMOS EL NUMERO ALEATORIO PARA NO USARLO MAS DE UNA VEZ
      numerosJugables.splice(randomIndex, 1);
      // JUGADAS ALEATORIAS
      let jugadaAleatoria = {
        id: uuid(),
        lugares: [],
        numero: numeroAleatorio,
        totalApostado: 0,
      };
      // ASIGNAMOS LA CANTIDAD A CADA LUGAR
      for (let j = 0; j < parseInt(sorteo.numLugares); j++) {
        const currentItem = j + 1;
        jugadaAleatoria.lugares[j] = numeroLugares.includes(
          currentItem.toString(),
        )
          ? monto.toString()
          : '0';
      }
      // CALCULAMOS EL TOTAL DE LA JUGADA
      jugadaAleatoria.totalApostado = jugadaAleatoria.lugares.reduce(
        (acc, cantidad) => acc + parseInt(cantidad),
        0,
      );
      jugadasAleatorias.push(jugadaAleatoria);
    }
    // GENERAMOS BOLETO MAGICO
    const boletoMagico = {
      agenteId: usuarioDb.id,
      codigoSorteo: sorteoDb.codigoSorteo,
      fechaExp: Moment(timestamp).format('YYYY-MM-DD'),
      fechaSorteo: sorteoDb.fecha,
      horaImpresion: Moment(timestamp).format('HH:mm:ss'),
      id: uuid(),
      jugadas: jugadasAleatorias,
      numeroAgencia: usuarioDb.usuario,
      numeroBoleto: await Utils.generateTicketId(),
      tipo: 'ticket magico',
      totalApostado: jugadasAleatorias.reduce(
        (acc, el) => acc + parseInt(el.totalApostado),
        0,
      ),
    };
    // SI LLEGO AL LIMITE DE VENTA PERMITIDO
    if (parseInt(creditoDisponible) <= 0)
      throw new Error('Limite de venta alcanzado.');
    // SI LLEGA AL LIMITE DE VENTA PERMITIDO AGREGANDO EL TOTAL DEL NUEVO BOLETO
    if (parseInt(creditoDisponible) - parseInt(boletoMagico.totalApostado) < 0)
      throw new Error(
        `Con el total de este boleto se supera el limite semanal, por favor ajusta el total de puntos e intenta nuevamente.\n\nTotal boleto ${
          boletoMagico.totalApostado
        }\nPuntos restantes ${Money(creditoDisponible, false)}`,
      );
    // SI NO HAY ERRORES GUARDAMOS EL BOLETO
    await Database.save(DATABASE_TABLES.TICKETS, boletoMagico);
    // ACTUALIZAR CREDITO DISPONIBLE
    const credito = await Database.getItem(
      DATABASE_TABLES.CREDITS,
      'usuario',
      usuarioDb.usuario,
    );
    // VERIFICAMOS SI EXISTE EL CREDITO
    if (credito) {
      // RESTAMOS LA VENTA DEL BOLETO AL CREDITO DISPONIBLE
      const totalVentaBoleto = Utils.totalWithoutCommissionTicket(
        boletoMagico.totalApostado,
      );
      const saldoNuevo = credito.saldo - totalVentaBoleto;
      await actualizarCredito(saldoNuevo, credito.key);
    }
    return boletoMagico;
  } catch ({message}) {
    throw new Error(message);
  }
}
// OBTENER GANDORES
export const obtenerPublicacionNumerosGanadores = async fechaSorteo => {
  try {
    const numerosGanadores = await Database.getItem(
      DATABASE_TABLES.WINNER_NUMBERS,
      'fechaSorteo',
      fechaSorteo,
    );
    return numerosGanadores;
  } catch ({message}) {
    throw new Error(message);
  }
};
// FUNCIONES PARA NUMEROS SATURADOS
function getSaturatedNumbers(newBoleto, boletos, limiteApuestas) {
  let todasLasJugadas = [];
  let jugadasDb = [];
  let obj = {numeros: [], jugadas: [], saturados: []};
  //OBTENER TODAS LAS JUGADAS DE CADA BOLETO
  boletos.forEach(b => {
    // console.log(b.jugadas);
    b.jugadas.forEach(jugada => {
      todasLasJugadas.push(jugada);
      jugadasDb.push(jugada);
    });
  });
  // VERIFICAMOS LAS JUGADAS
  newBoleto.jugadas.forEach(newJugada => {
    // AGREGAMOS LAS JUGADAS DEL NUEVO BOLETO
    todasLasJugadas.push(newJugada);
    let todasLasJugadasResults = getResults(newJugada, todasLasJugadas);
    let jugadasDbResults = getResults(newJugada, jugadasDb);
    let limitePorApuesta = getLimit(limiteApuestas, newJugada.numero);
    let posiciones = ['1', '2', '3'];
    //VERIFICAMOS CADA RESULTADO Y CHECAR SI EXCEDE EL LIMITE POR APUESTA
    todasLasJugadasResults.forEach((result, index) => {
      let resultadoDb = jugadasDbResults[index] ? jugadasDbResults[index] : 0;
      let resto = limitePorApuesta - resultadoDb;
      //SI EL RESULTADO ES MAYOR AL LIMITE PERMITIDO
      //GUARDAR LOS NUMEROS QUE SOBREPASAN EL LIMITE
      //LAS JUGADAS Y LOS SATURADOS
      if (result > limitePorApuesta) {
        //SI EL NUMERO NO ESTA EN LA LISTA , GUARDARLO
        if (obj.numeros.indexOf(newJugada.numero) === -1) {
          obj.numeros.push(newJugada.numero);
          obj.jugadas.push({
            numero: newJugada.numero,
            lugares: posiciones[index],
          });
          obj.saturados.push({
            [newJugada.numero]: {[posiciones[index]]: resto},
          });
        }
        //SI YA ESTA EL NUMERO , AÑADIR LA INFORMACION PARA LOS DEMAS LUGARES
        if (obj.numeros.indexOf(newJugada.numero) !== -1) {
          let posicionNumero = obj.numeros.indexOf(newJugada.numero);
          let jugadaLugares = obj.jugadas[posicionNumero].lugares;
          if (jugadaLugares.indexOf(posiciones[index]) === -1) {
            let jugadaActual = obj.saturados[posicionNumero][newJugada.numero];
            obj.jugadas[posicionNumero].lugares += ', ' + posiciones[index];
            jugadaActual[posiciones[index]] = resto;
          }
        }
      }
    });
  });

  return obj;
}
// GET RESULTS
function getResults(jugada, jugadas) {
  //OBTENER JUGADAS QUE COINCIDAN CON EL MISMO NUMERO
  let matched = jugadas.filter(j => jugada.numero === j.numero);
  //OBTENER LOS LUGARES DE CADA JUGADA
  let lugares = matched.map(m => m.lugares);
  //console.log(jugadas, matched)
  //SUMAR ELEMENTOS DEL MISMO INDICE Y RETORNARLOS
  return lugares.reduce((r, a) => {
    return a.map((b, i) => (parseInt(r[i]) || 0) + parseInt(b));
  }, []);
}
// GET LIMIT
function getLimit(data, apuesta) {
  let limit = 0;
  switch (apuesta.length) {
    case 1:
      limit = data.unaCifra;
      break;
    case 2:
      limit = data.dosCifras;
      break;
    case 3:
      limit = data.tresCifras;
      break;
    default:
      limit = 0;
      break;
  }
  return parseInt(limit);
}
// GET PAID PRIZES
export async function getPaidPrizes() {
  try {
    // VERIFICAMOS AL USUARIO
    const usuarioDB = await obtenerUsuarioDb();
    const timestamp = await Database.getServerDate();
    const periodo = Utils.getWeekPeriod(timestamp, 'hoy');
    const pagosRealizados = await Database.getItemsInRange(
      DATABASE_TABLES.PAID_PRIZES,
      'fechaPago',
      periodo.start,
      periodo.end,
      item => item.pagadoPor == usuarioDB.usuario,
    );
    return pagosRealizados;
  } catch ({message}) {
    throw new Error(message);
  }
}
// VERIFY TICKET
export const verifyTicket = async numeroBoleto => {
  try {
    // VERIFICAR USUARIO
    await obtenerUsuarioDb();
    const existeBoletoPagado = await Database.getItem(
      DATABASE_TABLES.PAID_PRIZES,
      'numeroBoleto',
      numeroBoleto,
    );
    // SI YA FUE PAGADO PREVIAMENTE
    if (existeBoletoPagado) throw new Error('Ya pagado previamente');
    // RECUPERAMOS EL BOLETO
    const boleto = await Database.getItem(
      DATABASE_TABLES.TICKETS,
      'numeroBoleto',
      numeroBoleto,
    );
    // SI NO SE ENCONTRO EL BOLETO
    if (!boleto) throw new Error('El boleto no fue encontrado');
    // OBTENEMOS LA FECHA DEL SERVIDOR
    const timestamp = await Database.getServerDate();
    const fecha = {
      servidor: timestamp,
      actual: Moment(timestamp).format('YYYY-MM-DD'),
      sorteo: boleto.fechaSorteo,
    };
    // OBTENEMOS LA HORA DE CIERRE DEL SORTEO
    const horaCierre = await Database.getObject(DATABASE_TABLES.CLOSING_TIME);
    const hora = {
      cierre: horaCierre.hora,
      actual: Moment(timestamp).format('HH:mm'),
    };
    // SI EL SORTEO AÚN NO SE CELEBRA
    if (
      Moment(fecha.servidor).isBefore(boleto.fechaSorteo) ||
      (Moment(fecha.servidor).isSame(boleto.fechaSorteo) &&
        Moment(hora.actual, 'HH:mm').isBefore(Moment(hora.cierre, 'HH:mm')))
    ) {
      throw new Error('Sin resultados');
    }
    // SI SE TRATA DE PAGAR UN PREMIO DE UN BOLETO QUE SE HAYA IMPRESO DESPUES DEL SORTEO
    if (Moment(boleto.fechaExp).isAfter(boleto.fechaSorteo)) {
      throw new Error('Boleto impreso después del sorteo');
    }
    // OBTENEMOS LOS NUMEROS GANADORES
    const publicacionGanadores = await Database.getItem(
      DATABASE_TABLES.WINNER_NUMBERS,
      'fechaSorteo',
      boleto.fechaSorteo,
    );
    // SI NO SE HAN PUBLICADO
    if (!publicacionGanadores) throw new Error('Sin resultados');
    // RESULTADO
    let resultado = {
      esGanador: false,
      premio: 0,
      boleto,
    };
    // ITERAMOS LOS NUMEROS GANADORES
    publicacionGanadores.numeros.forEach(
      (numeroGanador, numeroGanadorIndex) => {
        // ITERAMOS LAS JUGADAS DEL BOLETO
        boleto.jugadas.forEach(jugada => {
          let tresCifras = numeroGanador;
          let dosCifras = numeroGanador.slice(1);
          let unaCifra = numeroGanador.slice(2);
          let cantidadApostada = parseInt(jugada.lugares[numeroGanadorIndex]);
          // VERIFICAR SI COINCIDE CON LAS TRES CIFRAS
          if (tresCifras === jugada.numero && cantidadApostada) {
            resultado.premio += 550 * cantidadApostada;
            resultado.esGanador = true;
          }
          // VERIFICAR SI COINCIDE CON LAS DOS CIFRAS
          if (dosCifras === jugada.numero && cantidadApostada) {
            resultado.premio += 70 * cantidadApostada;
            resultado.esGanador = true;
          }
          // VERIFICAR SI COINCIDE CON UNA CIFRA
          if (unaCifra === jugada.numero && cantidadApostada) {
            resultado.premio += 7 * cantidadApostada;
            resultado.esGanador = true;
          }
        });
      },
    );
    // RETORNAMOS EL RESULTADO
    return resultado;
  } catch ({message}) {
    throw new Error(message);
  }
};
// PY PRIZE
export const payPrize = async boleto => {
  try {
    // VERIFY IF USER ACCOUNT STATUS IS UP TO DATE
    await verifyUserAccountStatus();
    // COMPLETAR INFORMACION PAGO
    const usuarioDB = await obtenerUsuarioDb();
    const timestamp = await Database.getServerDate();
    const informacionPago = {
      id: uuid(),
      fechaSorteo: boleto.fechaSorteo,
      fechaPago: Moment(timestamp).format('YYYY-MM-DD'),
      horaPago: Moment(timestamp).format('HH:mm:ss'),
      numeroBoleto: boleto.numeroBoleto,
      pagadoPor: usuarioDB.usuario,
      premio: boleto.premio,
      vendidoPor: boleto.numeroAgencia,
      nomComercial: usuarioDB.nomComercial,
      boleto,
      timestamp,
      boleto_id: boleto.id !== undefined ? boleto.id : '',
    };
    // GUARDAR PAGO
    await Database.save(DATABASE_TABLES.PAID_PRIZES, informacionPago);
    // ACTUALIZAMOS CREDITO
    const credito = await Database.getItem(
      DATABASE_TABLES.CREDITS,
      'usuario',
      usuarioDB.usuario,
    );
    // VERIFICAR SI EXISTE EL CREDITO
    let nuevoSaldo = 0;
    if (credito) {
      nuevoSaldo = parseFloat(credito.saldo) + parseInt(informacionPago.premio);
      await actualizarCredito(nuevoSaldo, credito.key);
    }
    // RETORNAR INFORMACION PAGO
    return {...informacionPago, nuevoSaldo};
  } catch ({message}) {
    throw new Error(message);
  }
};
// GET CANCELLED TICKETS
export async function getCanceledTickets() {
  try {
    const timestamp = await Database.getServerDate();
    const periodo = Utils.getWeekPeriod(timestamp, 'hoy');
    const usuarioDB = await obtenerUsuarioDb();
    const boletos = await Database.getItemsInRange(
      DATABASE_TABLES.CANCELED_TICKETS,
      'fechaCancelacion',
      periodo.start,
      periodo.end,
      item => item.agencia == usuarioDB.usuario,
    );

    return Utils.sortListByDate(boletos, 'fechaCancelacion', 'horaCancelacion');
  } catch ({message}) {
    throw new Error(message);
  }
}
// CANCEL TICKET
export async function cancelTicket(
  numeroBoleto,
  motivo = 'QR',
  otroContenido = null,
) {
  try {
    // VERIFY IF USER ACCOUNT STATUS IS UP TO DATE
    await verifyUserAccountStatus();
    // VERIFICAMOS AL USUARIO
    const usuarioDB = await obtenerUsuarioDb();
    const ticketCancelado = await Database.getItem(
      DATABASE_TABLES.CANCELED_TICKETS,
      'numeroBoleto',
      numeroBoleto,
    );
    // SI EL TICKET YA FUE CANCELADO
    if (ticketCancelado)
      throw new Error('El boleto ya fue cancelado previamente');
    // SI EL TICKET NO HA SIDO CANCELADO
    const ticket = await Database.getItem(
      DATABASE_TABLES.TICKETS,
      'numeroBoleto',
      numeroBoleto,
    );
    // SI EL BOLETO NO SE ENCONTRO
    if (ticket == null) throw new Error('El boleto no fue encontrado');
    // VERIFICAR SI EL SORTEO NO HA CERRADO
    // OBTENEMOS LA FECHA DEL SERVIDOR
    const timestamp = await Database.getServerDate();
    const fecha = {
      servidor: timestamp,
      actual: Moment(timestamp).format('YYYY-MM-DD'),
      sorteo: ticket.fechaSorteo,
    };
    // OBTENEMOS LA HORA DE CIERRE DEL SORTEO
    const horaCierre = await Database.getObject(DATABASE_TABLES.CLOSING_TIME);
    const hora = {
      cierre: horaCierre.hora,
      actual: Moment(timestamp).format('HH:mm'),
    };
    // SI EL SORTEO YA CERRO
    if (
      Moment(fecha.actual).isAfter(ticket.fechaSorteo) ||
      (Moment(fecha.sorteo).isSame(fecha.actual) &&
        Moment(hora.actual, 'HH:mm').isSameOrAfter(
          Moment(hora.cierre, 'HH:mm'),
        ))
    ) {
      throw new Error('Sorteo cerrado, el boleto ya no se puede cancelar');
    }
    // ESTRUCTURA BOLETO CANCELADO
    const ticketCanceladoInfo = {
      numeroBoleto: ticket.numeroBoleto,
      agencia: ticket.numeroAgencia,
      agenciaId: ticket.agenteId,
      fechaCancelacion: fecha.actual,
      fechaExp: ticket.fechaExp,
      reembolso: ticket.totalApostado,
      horaCancelacion: Moment(timestamp).format('HH:mm:ss'),
      tipoConcurso: 'bolita',
      timestamp: fecha.servidor,
      motivo,
      motivoDescripcion: otroContenido ? otroContenido : '',
      boleto: ticket,
      boleto_id: ticket.id,
    };
    // console.log(ticketCanceladoInfo);
    // ELIMINAR BOLETO DE LA BASE DE DATOS
    await Database.deleteItem(DATABASE_TABLES.TICKETS, ticket.key);
    // GUARDAMOS BOLETO CANCELADO
    await Database.save(DATABASE_TABLES.CANCELED_TICKETS, ticketCanceladoInfo);
    // ACTUALIZAR CREDITO DISPONIBLE
    const credito = await Database.getItem(
      DATABASE_TABLES.CREDITS,
      'usuario',
      usuarioDB.usuario,
    );
    // VERIFICAMOS SI EXISTE EL CREDITO
    let nuevoSaldo = 0;
    if (credito) {
      // SUMAMOS EL TOTAL APOSTADO DEL BOLETO AL CREDITO DISPONIBLE
      const totalVentaBoleto = Utils.totalWithoutCommissionTicket(
        ticket.totalApostado,
      );
      const nuevoCredito = credito.saldo + parseFloat(totalVentaBoleto);
      nuevoSaldo =
        nuevoCredito >= parseInt(usuarioDB.limiteVenta)
          ? parseInt(usuarioDB.limiteVenta)
          : nuevoCredito;
      await actualizarCredito(nuevoSaldo, credito.key);
    }
    // RETORNAMOS EL BOLETO
    return {...ticketCanceladoInfo, nuevoSaldo};
  } catch ({message}) {
    throw new Error(message);
  }
}
