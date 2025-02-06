import {Moment, Utils} from '../../utils';
import {getPeriodFromMonday, getServerTimestamp} from '../common';
// ###############################################################################
//                                                                               #
//                                                                               #
//               FUNCTIONS FOR NEW REPORT NOT SHARED WTH PANEL                   #
//                                                                               #
//                                                                               #
// ###############################################################################
export async function definePeriod(periodoSeleccionado = {}) {
  try {
    // SI EL PERIODO ES SEMANAL
    if (periodoSeleccionado.hasOwnProperty('inicial')) {
      return {
        start: periodoSeleccionado.inicial,
        end: periodoSeleccionado.final,
      };
    }
    // SI EL PERIODO ES DIARIO
    if (periodoSeleccionado.hasOwnProperty('nombre')) {
      const day = periodoSeleccionado.nombre;
      const timestamp = await getServerTimestamp();
      // SI ES HOY
      if (day === 'hoy') {
        return {
          start: Moment(timestamp).format('YYYY-MM-DD'),
          end: Moment(timestamp).format('YYYY-MM-DD'),
        };
      }
      // SI ES SEMANAL
      if (day === 'semanal') {
        return getPeriodFromMonday(timestamp);
      }
      // SI ES CUALQUIER DIA DE LA SEMANA
      const pastDateByDayName = Utils.getPastDateByDayName(timestamp, day);
      return {
        start: pastDateByDayName,
        end: pastDateByDayName,
      };
    }
  } catch ({message}) {
    throw new Error(message);
  }
}
