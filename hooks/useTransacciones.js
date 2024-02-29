import {useState} from 'react';
import {Helpers, Moment, Money} from '../utils';
import {getTransactions} from '../services/taecel';
import Database from '../database';
import {useDispatch} from 'react-redux';
import {setTransacciones} from '../features/taecel/taecelSlice';
import {useLogout} from './useLogout';
import {ERROR_CODE_NAMES} from '../errors';

export function useTransacciones() {
  const [cargandoTransacciones, setCargandoTransacciones] = useState(true);
  const [listaTransacciones, setListaTransacciones] = useState([]);
  const [totalTransacciones, setTotalTransacciones] = useState('0.00');
  const [periodo, setPeriodo] = useState({inicial: '', final: ''});
  const dispatch = useDispatch();
  const {logout} = useLogout();

  const cargarTransacciones = async id_semana => {
    try {
      setCargandoTransacciones(true);
      setListaTransacciones([]);
      const timestamp = await Database.getServerDate();
      const _fechas = obtenerPeriodo(timestamp, id_semana);
      let _transacciones = await getTransactions({
        inicial: _fechas[0],
        final: _fechas[_fechas.length - 1],
      });
      const cantidadesTransaccionesExitosas = [];
      _transacciones.forEach(t => {
        if (t.Status === 'Exitosa' || t.Status === 'PROCESSING') {
          let commission = t.Comision;
          // SI ES RECARGA
          if (['1', '2'].includes(t.CategoriaID)) {
            // commission =
            //   t._comisionRecargas !== undefined
            //     ? t._comisionRecargas
            //     : Money(2);
            commission = Money(0);
          }
          cantidadesTransaccionesExitosas.push(
            Helpers.sumArrayWithDecimals([t.Monto, t.Cargo, commission]),
          );
        }
      });

      setTotalTransacciones(
        Helpers.sumArrayWithDecimals(cantidadesTransaccionesExitosas),
      );
      setPeriodo({
        inicial: _fechas.length > 0 ? _fechas[0] : '',
        final: _fechas.length > 0 ? _fechas[_fechas.length - 1] : '',
      });

      setListaTransacciones(
        Helpers.ordenarElementos(
          _transacciones,
          (a, b) => Moment(b.Fecha).valueOf() - Moment(a.Fecha).valueOf(),
        ),
      );
      dispatch(
        setTransacciones(
          Helpers.ordenarElementos(
            _transacciones,
            (a, b) => Moment(b.Fecha).valueOf() - Moment(a.Fecha).valueOf(),
          ),
        ),
      );
      setCargandoTransacciones(false);
    } catch ({message}) {
      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      alert(message);
    }
  };

  const obtenerPeriodo = (timestamp, semanaID) => {
    let ocurrencies = 4;
    let ocurrenciesCounter = 0;
    let counter = 0;
    let dias_lunes = [];
    // OBTENEMOS SOLO LOS DIAS LUNES
    while (ocurrenciesCounter !== ocurrencies) {
      if (
        Moment(timestamp)
          .subtract(counter, 'days')
          .format('dddd')
          .toLowerCase() === 'lunes'
      ) {
        dias_lunes.push(
          Moment(timestamp).subtract(counter, 'days').format('YYYY-MM-DD'),
        );
        ocurrenciesCounter++;
      }
      counter++;
    }
    // FECHAS FINALES
    const fechasFinales = {
      0: Moment(timestamp).format('YYYY-MM-DD'),
      1: Moment(dias_lunes[0]).subtract(1, 'days').format('YYYY-MM-DD'),
      2: Moment(dias_lunes[1]).subtract(1, 'days').format('YYYY-MM-DD'),
      3: Moment(dias_lunes[2]).subtract(1, 'days').format('YYYY-MM-DD'),
    };
    // OBTENER DIAS DE LA SEMANA
    let _fechas = [];
    let counter2 = 0;
    while (
      !Moment(dias_lunes[semanaID])
        .add(counter2, 'days')
        .isSame(Moment(fechasFinales[semanaID]))
    ) {
      _fechas.push(
        Moment(dias_lunes[semanaID]).add(counter2, 'days').format('YYYY-MM-DD'),
      );
      counter2++;
    }
    _fechas.push(
      Moment(dias_lunes[semanaID]).add(counter2, 'days').format('YYYY-MM-DD'),
    );
    return _fechas;
  };

  return {
    cargandoTransacciones,
    listaTransacciones,
    totalTransacciones,
    periodo,
    cargarTransacciones,
  };
}
