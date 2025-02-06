import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bluetoothReducer from '../features/bluetooth/bluetoothSlice';
import creditoReducer from '../features/credito/creditoSlice';
import clienteReducer from '../features/tickets/cliente/clienteSlice';
import canceladosReducer from '../features/tickets/cancelados/canceladosSlice';
import ganadoresReducer from '../features/tickets/ganadores/ganadoresSlice';
import pagosReducer from '../features/tickets/pagos/pagosSlice';
import jugarTicketsReducer from '../features/tickets/jugarTickets/jugarTicketsSlice';
import magicoReducer from '../features/tickets/magico/magicoSlice';
import reportesReducer from '../features/tickets/reportes/reportesSlice';
import taecelReducer from '../features/taecel/taecelSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bluetooth: bluetoothReducer,
    credito: creditoReducer,
    cliente: clienteReducer,
    cancelados: canceladosReducer,
    ganadores: ganadoresReducer,
    jugarTickets: jugarTicketsReducer,
    magico: magicoReducer,
    pagos: pagosReducer,
    reportes: reportesReducer,
    taecel: taecelReducer,
  },
});
