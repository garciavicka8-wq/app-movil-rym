import {createSlice} from '@reduxjs/toolkit';

const bluetoothSlice = createSlice({
  name: 'bluetooth',
  initialState: {
    devicesList: [],
    scanning: false,
    connectingToDevice: false,
    connectedDevice: null,
    registeredDevice: null,
  },
  reducers: {
    setScanning: (state, {payload}) => {
      state.scanning = payload;
    },
    setDevicesList: (state, {payload}) => {
      state.devicesList = [...payload];
    },
    setConnectingToDevice: (state, {payload}) => {
      state.connectingToDevice = payload;
    },
    setConnectedDevice: (state, {payload}) => {
      state.connectedDevice = payload;
    },
    addDevice: (state, {payload}) => {
      let devicesListCopy = [...state.devicesList];
      if (devicesListCopy.find(item => item.id === payload.id) === undefined) {
        devicesListCopy = [{...payload}, ...state.devicesList];
      }
      state.devicesList = [...devicesListCopy];
    },
    registerDevice: (state, {payload}) => {
      state.registeredDevice = payload;
    },
  },
});

export const {
  setScanning,
  setDevicesList,
  setConnectedDevice,
  setConnectingToDevice,
  addDevice,
  registerDevice,
} = bluetoothSlice.actions;

export default bluetoothSlice.reducer;
