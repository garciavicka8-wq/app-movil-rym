import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  cargandoCredito: false,
  mostrarCredito: true,
  creditoDisponible: 0,
  fechaCredito: '',
};

const creditoSlice = createSlice({
  name: 'credito',
  initialState,
  reducers: {
    setCargandoCredito: (state, {payload}) => {
      state.cargandoCredito = payload;
    },
    setMostrarCredito: (state, {payload}) => {
      state.mostrarCredito = payload;
    },
    setCreditoDisponible: (state, {payload}) => {
      state.creditoDisponible = payload;
    },
    setFechaCredito: (state, {payload}) => {
      state.fechaCredito = payload;
    },
    sumarCredito: (state, {payload}) => {
      state.creditoDisponible = state.creditoDisponible + payload;
    },
    restarCredito: (state, {payload}) => {
      state.creditoDisponible = state.creditoDisponible - payload;
    },
    establecerCredito: (state, {payload}) => {
      state.creditoDisponible = payload;
    },
  },
});

export const {
  setCreditoDisponible,
  setMostrarCredito,
  sumarCredito,
  restarCredito,
  establecerCredito,
  setCargandoCredito,
  setFechaCredito,
} = creditoSlice.actions;

export default creditoSlice.reducer;
