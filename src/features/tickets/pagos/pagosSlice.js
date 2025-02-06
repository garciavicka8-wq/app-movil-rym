import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  cargandoPagos: false,
  pagosRealizados: [],
};

export const pagosSlice = createSlice({
  name: 'pagos',
  initialState,
  reducers: {
    setCargandoPagos: (state, {payload}) => {
      state.cargandoPagos = payload;
    },
    setPagosRealizados: (state, {payload}) => {
      state.pagosRealizados = [...payload];
    },
    agregarPagoRegistrado: (state, {payload}) => {
      state.pagosRealizados = state.pagosRealizados.concat(payload);
    },
  },
});

export const {setCargandoPagos, setPagosRealizados, agregarPagoRegistrado} =
  pagosSlice.actions;

export default pagosSlice.reducer;
