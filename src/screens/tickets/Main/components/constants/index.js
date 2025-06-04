const {Colors} = require('../../../../../utils');

const MENU_ITEMS = [
  {
    text: 'Registrar',
    buttonColor: Colors.lightRed,
    icon: 'receipt',
    iconColor: Colors.dark,
    textColor: Colors.primary,
    route: 'JUGAR_TICKETS',
    fullwidth: true,
  },
  {
    text: 'Pagos',
    buttonColor: Colors.lightRed,
    icon: 'account-cash',
    iconColor: Colors.green,
    textColor: Colors.primary,
    route: 'PAGOS',
    fullwidth: false,
  },
  {
    text: 'Cancelados',
    buttonColor: Colors.lightRed,
    icon: 'file-cancel',
    iconColor: Colors.primary,
    textColor: Colors.primary,
    route: 'CANCELAR',
    fullwidth: false,
  },
];

export {MENU_ITEMS};
