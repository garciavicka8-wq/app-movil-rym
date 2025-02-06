import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  // BOLETOS, CANCELADOS Y PAGOS
  // id, fecha, numeroBoleto, hora, total, tipo (boleto | cancelado | pago)
  registrosAlMomento: [],
};

const clienteSlice = createSlice({
  name: 'cliente',
  initialState,
  reducers: {
    agregarRegistroAlMomento: (state, {payload}) => {
      // PAYLOAD OBJECT
      state.registrosAlMomento = state.registrosAlMomento.concat(payload);
    },
    setRegistrosAlMomento: (state, {payload}) => {
      // PAYLOAD ARRAY
      state.registrosAlMomento = [...payload];
    },
  },
});

export const {agregarRegistroAlMomento, setRegistrosAlMomento} =
  clienteSlice.actions;

export default clienteSlice.reducer;
