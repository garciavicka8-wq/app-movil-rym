import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    verifyingUser: true,
    isUserLoggedIn: false,
  },
  reducers: {
    setVerifyingUser: function (state, {payload}) {
      state.verifyingUser = payload;
    },
    setIsUserLoggedIn: function (state, {payload}) {
      state.isUserLoggedIn = payload;
    },
  },
});

export const {setVerifyingUser, setIsUserLoggedIn} = authSlice.actions;

export default authSlice.reducer;
