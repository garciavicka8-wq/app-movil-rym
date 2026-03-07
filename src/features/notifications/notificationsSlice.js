import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  unreadCount: 0,
  list: [],
  loading: false,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: state => {
      state.unreadCount += 1;
    },
    setNotificationsList: (state, action) => {
      state.list = action.payload;
    },
    appendNotification: (state, action) => {
      state.list.unshift(action.payload);
    },
    clearNotifications: state => {
      state.unreadCount = 0;
      state.list = [];
    },
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  setNotificationsList,
  appendNotification,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
