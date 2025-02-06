import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  cargandoSorteosJugados: false,
  sorteosJugados: [],
  sorteoSelected: null,
  cargandoPublicacion: false,
  publicacion: null,
};

export const ganadoresSlice = createSlice({
  name: 'ganadores',
  initialState,
  reducers: {
    setCargandoSorteosJugados: (state, {payload}) => {
      state.cargandoSorteosJugados = payload;
    },
    setSorteosJugados(state, {payload}) {
      state.sorteosJugados = [...payload];
    },
    setSorteoSelected: (state, {payload}) => {
      state.sorteoSelected = {...payload};
    },
    setCargandoPublicacion: (state, {payload}) => {
      state.cargandoPublicacion = payload;
    },
    setPublicacion: (state, {payload}) => {
      state.publicacion = {...payload};
    },
  },
});

export const {
  setCargandoSorteosJugados,
  setSorteosJugados,
  setSorteoSelected,
  setPublicacion,
  setCargandoPublicacion,
} = ganadoresSlice.actions;

export default ganadoresSlice.reducer;
