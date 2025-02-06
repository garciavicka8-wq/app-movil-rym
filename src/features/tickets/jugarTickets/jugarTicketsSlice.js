import {createSlice} from '@reduxjs/toolkit';
import {Helpers} from '../../../utils';

const initialState = {
  cargandoProximosSorteos: true,
  proximosSorteos: [],
  jugadas: [],
  sorteoSeleccionado: null,
  totalApostado: 0,
  boletosVendidos: [],
};

export const jugarTicketsSlice = createSlice({
  name: 'jugarTickets',
  initialState,
  reducers: {
    setCargandoProximosSorteos: (state, {payload}) => {
      state.cargandoProximosSorteos = payload;
      state.jugadas = [];
    },
    setProximosSorteos: (state, {payload}) => {
      state.proximosSorteos = Helpers.sortListByDate(
        [...payload],
        'fecha',
        'asc',
      );
    },
    setJugadas: (state, {payload}) => {
      state.jugadas = [...payload];
    },
    setSorteoSeleccionado: (state, {payload}) => {
      state.sorteoSeleccionado = {...payload};
      state.proximosSorteos = [...state.proximosSorteos].map(item => ({
        ...item,
        selected: item.id === payload.id,
      }));
      state.jugadas = [];
      state.totalApostado = 0;
    },
    setBoletosVendidos: (state, {payload}) => {
      state.boletosVendidos = [...payload];
    },
    agregarJugadaStore: (state, {payload}) => {
      state.jugadas = [...state.jugadas, payload];
    },
    agregarBoletoVendidoStore: (state, {payload}) => {
      state.boletosVendidos = [...state.boletosVendidos, payload];
    },
  },
});

export const {
  setCargandoProximosSorteos,
  setProximosSorteos,
  setJugadas,
  setSorteoSeleccionado,
  setBoletosVendidos,
  agregarJugadaStore,
  agregarBoletoVendidoStore,
} = jugarTicketsSlice.actions;

export default jugarTicketsSlice.reducer;
