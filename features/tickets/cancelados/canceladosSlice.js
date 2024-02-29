import {createSlice} from '@reduxjs/toolkit';
import {Helpers} from '../../../utils';

const initialState = {
  cargandoCancelados: false,
  boletosCancelados: [],
};

export const canceladosSlice = createSlice({
  name: 'cancelados',
  initialState,
  reducers: {
    setCargandoCancelados: (state, {payload}) => {
      state.cargandoCancelados = payload;
    },
    setBoletosCancelados: (state, {payload}) => {
      state.boletosCancelados = Helpers.sortListByDate(
        [...payload],
        'fechaCancelacion',
      );
    },
    agregarBoletoCancelado: (state, {payload}) => {
      state.boletosCancelados = [{...payload}, ...state.boletosCancelados];
    },
  },
});

export const {
  setCargandoCancelados,
  setBoletosCancelados,
  agregarBoletoCancelado,
} = canceladosSlice.actions;

export default canceladosSlice.reducer;
