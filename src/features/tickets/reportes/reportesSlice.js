import {createSlice} from '@reduxjs/toolkit';
import {Moment} from '../../../utils';

const initialState = {
  cargandoPeriodos: true,
  dias: [
    {nombre: 'hoy', active: false},
    {nombre: 'lunes', active: false},
    {nombre: 'martes', active: false},
    {nombre: 'miercoles', active: false},
    {nombre: 'jueves', active: false},
    {nombre: 'viernes', active: false},
    {nombre: 'sabado', active: false},
    {nombre: 'domingo', active: false},
    {nombre: 'semanal', active: false},
  ],
  periodos: [],
  creandoReporte: false,
  // ESTADO DE CUENTA STARTS
  tipoEstadoDeCuenta: '', //diario || semanal
  periodoSeleccionado: null, // string | obj
  cargandoEstadoDeCuenta: true,
  semanaEnCurso: false,
  estadoDeCuenta: {
    referencia: '', // 2023-03-06#2023-03-12#37001 [fechaInicial#fechaFinal#numeroUsuario]
    ventas: {
      ticketplus: {
        registros: 0,
        total: 0,
      },
      recargas: {
        registros: 0,
        total: 0,
      },
      pagoServicios: {
        registros: 0,
        total: 0,
      },
      giftcards: {
        registros: 0,
        total: 0,
      },
      sumaTotales: 0,
    },
    comisiones: {
      pagoPremios: {
        inicioSem: {
          registros: 0,
          total: 0,
        },
        restoSem: {
          registros: 0,
          total: 0,
        },
      },
      ticketplus: {
        registros: 0,
        total: 0,
      },
      recargas: {
        registros: 0,
        total: 0,
      },
      pagoServicios: {
        registros: 0,
        total: 0,
      },
      giftcards: {
        registros: 0,
        total: 0,
      },
      sumaTotales: 0,
    },
    cancelaciones: {
      registros: 0,
      total: 0,
    },
    importe: 0,
  },
  // ESTADO DE CUENTA ENDS
};

const reportesSlice = createSlice({
  name: 'reportes',
  initialState,
  reducers: {
    setCargandoPeriodos: (state, {payload}) => {
      state.cargandoPeriodos = payload;
    },
    setPeriodos: (state, {payload}) => {
      state.periodos = [...payload];
    },
    setCreandoReporte: (state, {payload}) => {
      state.creandoReporte = payload;
    },
    cambiarEstadoBotones: (state, {payload}) => {
      const {tipo, info} = payload;
      if (tipo === 'diario') {
        state.periodos = [...state.periodos].map(item => ({
          ...item,
          active: false,
        }));
        state.dias = [...state.dias].map(item => ({
          ...item,
          active: item.nombre === info.nombre,
        }));
      }
      if (tipo === 'semanal') {
        state.dias = [...state.dias].map(item => ({
          ...item,
          active: false,
        }));
        state.periodos = [...state.periodos].map(item => ({
          ...item,
          active: Moment(item.final).isSame(info.final),
        }));
      }
    },
    resetBotonesReporte: (state, {payload}) => {
      state.dias = [
        {nombre: 'hoy', active: false},
        {nombre: 'lunes', active: false},
        {nombre: 'martes', active: false},
        {nombre: 'miercoles', active: false},
        {nombre: 'jueves', active: false},
        {nombre: 'viernes', active: false},
        {nombre: 'sabado', active: false},
        {nombre: 'domingo', active: false},
        {nombre: 'semanal', active: false},
      ];
      state.periodos = [];
    },
    // ESTADO DE CUENTA STARTS
    setCargandoEstadoDeCuenta: (state, {payload}) => {
      state.cargandoEstadoDeCuenta = payload;
    },
    setEstadoDeCuenta: (state, {payload}) => {
      state.estadoDeCuenta = {...payload};
    },
    setTipoEstadoDeCuenta: (state, {payload}) => {
      state.tipoEstadoDeCuenta = payload;
    },
    setPeriodoSeleccionado: (state, {payload}) => {
      state.periodoSeleccionado = {...payload};
    },
    setSemanaEnCurso: (state, {payload}) => {
      state.semanaEnCurso = payload;
    },
    // ESTADO DE CUENTA ENDS
  },
});

export const {
  setCargandoPeriodos,
  setPeriodos,
  setCreandoReporte,
  cambiarEstadoBotones,
  resetBotonesReporte,
  setCargandoEstadoDeCuenta,
  setEstadoDeCuenta,
  setTipoEstadoDeCuenta,
  setPeriodoSeleccionado,
  setSemanaEnCurso,
} = reportesSlice.actions;

export default reportesSlice.reducer;
