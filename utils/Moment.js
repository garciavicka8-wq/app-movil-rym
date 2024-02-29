import moment from 'moment-timezone';
// SET DEFAULT TIMEZONE
moment.tz.setDefault('America/Mexico_City');

moment.locale('es', {
  months:
    'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split(
      '_',
    ),
  monthsShort: 'ene_feb_mar_abr_may_jun_jul_ago_sept_oct_nov_dic'.split('_'),
  monthsParseExact: true,
  weekdays: 'domingo_lunes_martes_miercoles_jueves_viernes_sabado'.split('_'),
  weekdaysShort: 'dom._lun._mar._mie._jue._vie._sab.'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_'),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd D MMMM YYYY',
  },
});

moment.locale('es');

export default moment;
