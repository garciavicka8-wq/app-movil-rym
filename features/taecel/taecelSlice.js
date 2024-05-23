import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  bolsas: [],
  categorias: [],
  carriersFiltradas: [],
  queryCarrierResults: [],
  productos: [],
  productosFiltrados: [],
  filtrandoProductos: false,
  categoriaSeleccionada: null,
  carrierSeleccionado: null,
  productoSeleccionado: null,
  transacciones: [],
  transaccionStore: null,
  // NEW PROPS TO IMPROVE PERFORMANCE
  loadingProducts: false,
  mainProducts: [],
  categories: [],
  carriers: [],
  products: [],
  selectedCategory: null,
};

export const taecelSlice = createSlice({
  name: 'taecel',
  initialState,
  reducers: {
    setBolsas: (state, {payload}) => {
      state.bolsas = [...payload];
    },
    setCategorias: (state, {payload}) => {
      state.categorias = [...payload];
    },
    // setCarriers: (state, {payload}) => {
    //   state.carriers = [...payload];
    //   state.carriersFiltradas = [...payload];
    //   state.queryCarrierResults = [...payload];
    // },
    setProductos: (state, {payload}) => {
      state.productos = [...payload];
    },
    setFiltrandoProductos: (state, {payload}) => {
      state.filtrandoProductos = payload;
    },
    setProductosFiltrados: (state, {payload}) => {
      state.productosFiltrados = [...payload];
    },
    setCategoriaSeleccionada: (state, {payload}) => {
      state.categoriaSeleccionada = {...payload};
    },
    filtrarCarriers: (state, {payload}) => {
      state.carriersFiltradas = [...state.carriers].filter(
        c => c.CategoriaID === payload,
      );
      state.queryCarrierResults = [...state.carriers].filter(
        c => c.CategoriaID === payload,
      );
    },
    setQueryCarrierResults: (state, {payload}) => {
      state.queryCarrierResults = [...payload];
    },
    setCarrierSeleccionado: (state, {payload}) => {
      state.carrierSeleccionado = {...payload};
    },
    setTransacciones: (state, {payload}) => {
      state.transacciones = [...payload];
    },
    setTransaccionStore: (state, {payload}) => {
      state.transaccionStore = {...payload};
    },
    setProductoSeleccionado: (state, {payload}) => {
      state.productoSeleccionado = payload;
    },
    // NEW SETTERS TO IMPROVE PERFORMANCE
    setLoadingProducts: function (state, {payload}) {
      state.loadingProducts = payload;
    },
    setMainProducts: function (state, {payload}) {
      state.mainProducts = [...payload];
    },
    setCategories: function (state, {payload}) {
      state.categories = [...payload];
    },
    setCarriers: function (state, {payload}) {
      state.carriers = [...payload];
    },
    setProducts: function (state, {payload}) {
      state.products = [...payload];
    },
    setSelectedCategory: function (state, {payload}) {
      state.selectedCategory = {...payload};
    },
  },
});

export const {
  setBolsas,
  setCategorias,
  setProductos,
  setFiltrandoProductos,
  setProductosFiltrados,
  setCategoriaSeleccionada,
  filtrarCarriers,
  setQueryCarrierResults,
  setCarrierSeleccionado,
  setProductoSeleccionado,
  setTransacciones,
  setTransaccionStore,
  // NEW SETTERS
  setLoadingProducts,
  setMainProducts,
  setCarriers,
  setCategories,
  setProducts,
  setSelectedCategory,
} = taecelSlice.actions;

export default taecelSlice.reducer;
