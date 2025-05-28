import {TICKET_TYPE} from '../../../../constants';
import {
  getLimiteApuestas,
  getSorteo,
  getTicketsPorSorteo,
  saveTicket,
  updateCreditoUsuario,
  getTimestamp,
} from '../../../../database/facade';
import {obtenerUsuarioDb} from '../../../../services/auth';
import {verifyUserAccountStatus} from '../../../../services/reports';
import {Moment, Money, Storage, Utils, uuid} from '../../../../utils';
const {generateTicketId, sumValuesByIndex} = Utils;

export async function registrarTicket(
  sorteo,
  jugadas,
  creditoDisponible = 0,
  viaWhatsapp = false,
  numeroTelefono = '',
) {
  try {
    // VALIDAR JUGADAS QUE NO ESTE VACIO
    if (!jugadas || jugadas.length === 0) {
      throw new Error('No se han ingresado jugadas válidas.');
    }
    // VERIFY IF USER STATUS IS UP TO DATE
    await verifyUserAccountStatus();
    // VERIFICAR VERSION DE APP
    const usuarioDb = await obtenerUsuarioDb();
    // SI EL USUARIO EXISTE Y ESTA ACTIVO
    const sorteoDb = await getSorteo(sorteo.id);
    // OBTENER LOS BOLETOS DEL SORTEO SELECCIONADO
    const boletosRegistrados = await getTicketsPorSorteo(sorteoDb.fecha);
    // OBTENER LIMITE DE APUESTAS
    const limiteApuestas = await getLimiteApuestas();
    // FECHA SERVIDOR
    const timestamp = await getTimestamp();
    const momentInstance = Moment(timestamp);
    // ESTRUCTURA DEL NUEVO BOLETO
    const newBoleto = {
      id: uuid(),
      tipo: TICKET_TYPE.PLUS,
      numeroBoleto: generateTicketId(),
      numeroAgencia: usuarioDb.usuario,
      jugadas: jugadas,
      agenteId: usuarioDb.id,
      codigoSorteo: sorteoDb.codigoSorteo,
      fechaSorteo: sorteoDb.fecha,
      fechaExp: momentInstance.format('YYYY-MM-DD'),
      horaImpresion: momentInstance.format('HH:mm:ss'),
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
    await saveTicket(newBoleto);
    // ACTUALIZAR CREDITO DISPONIBLE
    await updateCreditoUsuario(usuarioDb.usuario, newBoleto.totalApostado);

    return newBoleto;
  } catch (err) {
    console.error('Error atrapado:', err);
    throw new Error(err.message || JSON.stringify(err));
  }
}

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
    // VERIFY IF USER STATUS IS UP TO DATE
    await verifyUserAccountStatus();
    const usuarioDb = await obtenerUsuarioDb();
    const sorteoDb = await getSorteo(sorteo.id);
    const boletos = await getTicketsPorSorteo(sorteoDb.fecha);
    const limiteApuestas = await getLimiteApuestas();
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

    const jugadas = boletos.reduce((acc, item) => acc.concat(item.jugadas), []);

    const numeros = mapNumeros(jugadas, cifras);

    const numerosInJugables = buildNumerosInjugables(
      numeros,
      numeroLugares,
      monto,
      limite,
    );

    const numerosJugables = buildNumerosJugables(numerosInJugables, cifras);

    const jugadasAleatorias = buildJugadasAleatorias(
      numerosJugables,
      sorteo.numLugares,
      numeroLugares,
      numeroJugadas,
      monto,
    );

    const timestamp = await getTimestamp();
    const momentInstance = Moment(timestamp);
    const boletoMagico = {
      agenteId: usuarioDb.id,
      codigoSorteo: sorteoDb.codigoSorteo,
      fechaExp: momentInstance.format('YYYY-MM-DD'),
      fechaSorteo: sorteoDb.fecha,
      horaImpresion: momentInstance.format('HH:mm:ss'),
      id: uuid(),
      jugadas: jugadasAleatorias,
      numeroAgencia: usuarioDb.usuario,
      numeroBoleto: generateTicketId(),
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

    await saveTicket(boletoMagico);

    await updateCreditoUsuario(usuarioDb.usuario, boletoMagico.totalApostado);

    return boletoMagico;
  } catch ({message}) {
    throw new Error(message);
  }
}

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

function getResults(jugada, jugadas) {
  return jugadas.reduce((acc, j) => {
    if (j.numero !== jugada.numero) return acc;

    j.lugares.forEach((valor, i) => {
      acc[i] = (acc[i] || 0) + Number(valor);
    });

    return acc;
  }, []);
}

function getLimit(data, apuesta) {
  const limits = {
    1: data.unaCifra,
    2: data.dosCifras,
    3: data.tresCifras,
  };

  return parseInt(limits[apuesta.length] || 0);
}

function mapNumeros(jugadas, cifras) {
  const numeros = {};
  jugadas.forEach(jugada => {
    if (jugada.numero.length === parseInt(cifras)) {
      if (numeros[jugada.numero] === undefined) {
        numeros[jugada.numero] = jugada.lugares;
      } else {
        numeros[jugada.numero] = sumValuesByIndex(
          numeros[jugada.numero],
          jugada.lugares,
        );
      }
    }
  });
  return numeros;
}

function buildNumerosInjugables(numeros, numeroLugares, monto, limite) {
  const numerosInJugables = [];
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
  return numerosInJugables;
}

function buildNumerosJugables(numerosInJugables = [], cifras) {
  const TOTAL_NUMEROS = {
    1: 10,
    2: 100,
    3: 1000,
  };
  const numerosJugables = [];
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
  return numerosJugables;
}

function buildJugadasAleatorias(
  numerosJugables = [],
  sorteoNumeroLugares,
  numeroLugares,
  numeroJugadas,
  monto,
) {
  const jugadasAleatorias = [];
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

    for (let j = 0; j < parseInt(sorteoNumeroLugares); j++) {
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
  return jugadasAleatorias;
}
