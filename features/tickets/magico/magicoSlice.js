import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  proximosSorteos: [],
  sorteoSeleccionado: null,
  numeroJugadas: '1',
  cifras: '3',
  numeroLugares: ['1'],
  monto: '1',
};

const magicoSlice = createSlice({
  name: 'magico',
  initialState,
  reducers: {
    setProximosSorteos: function (state, {payload}) {
      state.proximosSorteos = [...payload];
    },
    setSorteoSeleccionado: function (state, {payload}) {
      state.sorteoSeleccionado = {...payload};
    },
    setNumeroJugadas: function (state, {payload}) {
      state.numeroJugadas = payload;
    },
    setCifras: function (state, {payload}) {
      state.cifras = payload;
    },
    setNumeroLugares: function (state, {payload}) {
      state.numeroLugares = [...payload];
    },
    setMonto: function (state, {payload}) {
      state.monto = payload;
    },
  },
});

export const {
  setProximosSorteos,
  setSorteoSeleccionado,
  setNumeroJugadas,
  setNumeroLugares,
  setCifras,
  setMonto,
} = magicoSlice.actions;

export default magicoSlice.reducer;
