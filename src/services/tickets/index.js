import Database from '../../database';
import {Helpers, Moment, Money, Storage, Utils, uuid} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import {DATABASE_TABLES} from '../constants';
import {actualizarCredito} from '../credito';
import {verifyUserAccountStatus} from '../reports';
import * as Request from '../http';
import {TICKET_TYPE} from '../../constants';

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
      tipo: TICKET_TYPE.PLUS,
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
    let message = '';
    numerosSaturados.saturados.forEach(saturado => {
      const [numero, item] = Object.entries(saturado)[0]; // Extrae número y valores en una sola operación
      const text_values = Object.entries(item)
        .map(([position, cantidad]) => {
          return `${position}°(${cantidad == '0' ? 'agotado' : cantidad})`; // Genera texto por cada posición
        })
        .join(' '); // Unir todos los textos de posiciones con espacio

      message += `${numero}: ${text_values}\n`; // Añadir al mensaje
    });
    // SI HAY NUMEROS SATURADOS
    if (numerosSaturados.saturados.length > 0) {
      Storage.setItem('saturados', numerosSaturados.saturados, true);
      throw new Error(message);
    }
    // SI LLEGO AL LIMITE DE VENTA PERMITIDO
    if (parseInt(creditoDisponible) <= 0)
      throw new Error('Limite de venta alcanzado.');
    // SI LLEGA AL LIMITE DE VENTA PERMITIDO AGREGANDO EL TOTAL DEL NUEVO BOLETO
    if (parseInt(creditoDisponible) - parseInt(newBoleto.totalApostado) < 0) {
      throw new Error(
        `Con el total de este boleto se supera el limite semanal, por favor ajusta el total de puntos e intenta nuevamente.\n\nTotal boleto ${
          newBoleto.totalApostado
        }\nPuntos restantes ${Money(creditoDisponible, false)}`,
      );
    }
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
  viaWhatsapp = false,
  numeroTelefono = '',
}) {
  try {
    await verifyUserAccountStatus();
    const usuarioDb = await obtenerUsuarioDb();
    const sorteoDb = await Database.getItem(
      DATABASE_TABLES.DRAWS,
      'id',
      sorteo.id,
    );
    if (!sorteoDb) throw new Error('El sorteo que intentas jugar no existe');
    if (sorteoDb.activo !== undefined && !sorteoDb.activo)
      throw new Error('El sorteo que intentas jugar fue desactivado');

    const horaCierre = await Database.getObject(DATABASE_TABLES.CLOSING_TIME);
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

    if (
      Moment(fecha.sorteo).isSame(fecha.actual) &&
      Moment(hora.actual, 'HH:mm').isSameOrAfter(Moment(hora.cierre, 'HH:mm'))
    ) {
      throw new Error('Lo sentimos, el sorteo ha cerrado');
    }
    if (Moment(fecha.actual).isAfter(fecha.sorteo)) {
      throw new Error('Lo sentimos, el sorteo seleccionado ya fue celebrado');
    }

    const boletos = await Database.getItemsByProp(
      DATABASE_TABLES.TICKETS,
      'fechaSorteo',
      sorteoDb.fecha,
    );
    const limiteApuestas = await Database.getObject(DATABASE_TABLES.BET_LIMIT);

    // VALIDAR MONTO ANTES DE PROCESAR JUGADAS
    const CIFRAS = {
      1: 'unaCifra',
      2: 'dosCifras',
      3: 'tresCifras',
    };
    const limite = limiteApuestas[CIFRAS[cifras]];

    if (parseInt(monto) > limite) {
      throw new Error(
        `El monto por lugar supera el límite de apuesta permitido (${limite}).`,
      );
    }

    let jugadas = boletos.reduce((acc, item) => acc.concat(item.jugadas), []);

    let numeros = {};
    jugadas.forEach(jugada => {
      if (jugada.numero.length === parseInt(cifras)) {
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

    let numerosInJugables = [];
    for (const [numero, lugares] of Object.entries(numeros)) {
      let excedeLimite = false;
      for (let i = 0; i < lugares.length; i++) {
        const lugar = (i + 1).toString();
        if (numeroLugares.includes(lugar)) {
          const cantidadActual = parseInt(lugares[i]);
          const total = cantidadActual + parseInt(monto);
          if (total > limite) {
            excedeLimite = true;
            break;
          }
        }
      }
      if (excedeLimite) {
        numerosInJugables.push(numero);
      }
    }

    const TOTAL_NUMEROS = {
      1: 10,
      2: 100,
      3: 1000,
    };
    let numerosJugables = [];
    for (let i = 0; i < TOTAL_NUMEROS[cifras]; i++) {
      let numero = i;
      if (cifras == '2' && i < 10) numero = '0' + i;
      if (cifras == '3' && i < 10) numero = '00' + i;
      if (cifras == '3' && i >= 10 && i < 100) numero = '0' + i;

      if (!numerosInJugables.includes(numero.toString())) {
        numerosJugables.push(numero.toString());
      }
    }

    if (numerosJugables.length === 0)
      throw new Error(
        'Lo sentimos los números de ' +
          cifras +
          ' cifras se han agotado, intenta con otra cifra.',
      );

    let jugadasAleatorias = [];
    for (let i = 0; i < parseInt(numeroJugadas); i++) {
      const randomIndex = Math.floor(Math.random() * numerosJugables.length);
      const numeroAleatorio = numerosJugables[randomIndex];
      if (numeroAleatorio === undefined) break;

      numerosJugables.splice(randomIndex, 1);

      let jugadaAleatoria = {
        id: uuid(),
        lugares: [],
        numero: numeroAleatorio,
        totalApostado: 0,
      };

      for (let j = 0; j < parseInt(sorteo.numLugares); j++) {
        const currentItem = j + 1;
        jugadaAleatoria.lugares[j] = numeroLugares.includes(
          currentItem.toString(),
        )
          ? monto.toString()
          : '0';
      }

      jugadaAleatoria.totalApostado = jugadaAleatoria.lugares.reduce(
        (acc, cantidad) => acc + parseInt(cantidad),
        0,
      );

      jugadasAleatorias.push(jugadaAleatoria);
    }

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
      tipo: TICKET_TYPE.MAGICO,
      totalApostado: jugadasAleatorias.reduce(
        (acc, el) => acc + parseInt(el.totalApostado),
        0,
      ),
      via: viaWhatsapp ? 'whatsapp' : 'impresion',
      telefono: numeroTelefono,
    };

    if (parseInt(creditoDisponible) <= 0)
      throw new Error('Limite de venta alcanzado.');

    if (parseInt(creditoDisponible) - parseInt(boletoMagico.totalApostado) < 0)
      throw new Error(
        `Con el total de este boleto se supera el limite semanal, por favor ajusta el total de puntos e intenta nuevamente.\n\nTotal boleto ${
          boletoMagico.totalApostado
        }\nPuntos restantes ${Money(creditoDisponible, false)}`,
      );

    await Database.save(DATABASE_TABLES.TICKETS, boletoMagico);

    const credito = await Database.getItem(
      DATABASE_TABLES.CREDITS,
      'usuario',
      usuarioDb.usuario,
    );

    if (credito) {
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
  let obj = {numeros: [], jugadas: [], saturados: []};

  // Obtener todas las jugadas de los boletos existentes
  const todasLasJugadas = boletos.flatMap(b => b.jugadas);

  // Obtener todas las jugadas de los boletos existentes y del nuevo boleto
  const todasLasJugadasCompletas = [...todasLasJugadas, ...newBoleto.jugadas];

  // Función para obtener el límite por apuesta
  const obtenerLimitePorApuesta = numero => getLimit(limiteApuestas, numero);

  // Función para agregar o actualizar la información de los números saturados
  const agregarSaturado = (numero, posicion, resto) => {
    const idx = obj.numeros.indexOf(numero);

    if (idx === -1) {
      obj.numeros.push(numero);
      obj.jugadas.push({numero, lugares: posicion});
      obj.saturados.push({[numero]: {[posicion]: resto}});
    } else {
      let jugadaLugares = obj.jugadas[idx].lugares;
      if (!jugadaLugares.includes(posicion)) {
        obj.jugadas[idx].lugares += `, ${posicion}`;
        obj.saturados[idx][numero][posicion] = resto;
      }
    }
  };

  // Verificar cada jugada del nuevo boleto
  newBoleto.jugadas.forEach(newJugada => {
    const posiciones = ['1', '2', '3'];

    // Obtener los resultados de las jugadas
    const todasLasJugadasResults = getResults(
      newJugada,
      todasLasJugadasCompletas,
    );
    const jugadasDbResults = getResults(newJugada, todasLasJugadas);

    // Obtener el límite por apuesta
    const limitePorApuesta = obtenerLimitePorApuesta(newJugada.numero);

    // Verificar cada resultado y si excede el límite
    todasLasJugadasResults.forEach((result, index) => {
      const resultadoDb = jugadasDbResults[index] || 0;
      const resto = limitePorApuesta - resultadoDb;

      if (result > limitePorApuesta) {
        agregarSaturado(newJugada.numero, posiciones[index], resto);
      }
    });
  });

  return obj;
}
// GET RESULTS
function getResults(jugada, jugadas) {
  return jugadas.reduce((acc, j) => {
    if (j.numero !== jugada.numero) return acc;

    j.lugares.forEach((valor, i) => {
      acc[i] = (acc[i] || 0) + Number(valor);
    });

    return acc;
  }, []);
}
// GET LIMIT
function getLimit(data, apuesta) {
  const limits = {
    1: data.unaCifra,
    2: data.dosCifras,
    3: data.tresCifras,
  };

  return parseInt(limits[apuesta.length] || 0);
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
    const formatedDate = formatStr => Moment(timestamp).format(formatStr);
    const informacionPago = {
      id: uuid(),
      fechaSorteo: boleto.fechaSorteo,
      fechaPago: formatedDate('YYYY-MM-DD'),
      horaPago: formatedDate('HH:mm:ss'),
      numeroBoleto: boleto.numeroBoleto,
      pagadoPor: usuarioDB.usuario,
      premio: boleto.premio,
      vendidoPor: boleto.numeroAgencia,
      nomComercial: usuarioDB.nomComercial,
      boleto,
      timestamp,
      boleto_id: boleto.id !== undefined ? boleto.id : '',
      capturaUrl: boleto.capturaUrl,
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

export async function uploadTicketCapture(formData) {
  try {
    const response = await Request.post(
      'comprobantes/premios/subirCaptura',
      formData,
      false,
    );
    if (response.data.data.error) {
      throw new Error(response.data.data.error_message);
    }

    return response.data.data.url || '';
  } catch (error) {
    throw new Error(error.message);
  }
}
