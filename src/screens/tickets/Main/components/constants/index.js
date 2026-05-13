const {Colors} = require('../../../../../utils');

const MENU_ITEMS = [
  {
    text: 'Registrar Ticket',
    buttonColor: 'rgba(139, 92, 246, 0.15)', // pastel purple
    icon: 'receipt',
    iconColor: '#8B5CF6', // purple
    textColor: Colors.dark,
    route: 'JUGAR_TICKETS',
    fullwidth: true,
  },
  {
    text: 'Pagos',
    buttonColor: 'rgba(16, 185, 129, 0.15)', // pastel green
    icon: 'cash-multiple',
    iconColor: '#10B981', // green
    textColor: Colors.dark,
    route: 'PAGOS',
    fullwidth: false,
  },
  {
    text: 'Cancelados',
    buttonColor: 'rgba(239, 68, 68, 0.15)', // pastel red
    icon: 'cancel',
    iconColor: '#EF4444', // red
    textColor: Colors.dark,
    route: 'CANCELAR',
    fullwidth: false,
  },
];

export {MENU_ITEMS};
