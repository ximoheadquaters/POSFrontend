import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const initialState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.push({
        id: nextId++,
        type: 'info',
        message: action.payload.message || '',
        duration: action.payload.duration || 5000,
        createdAt: new Date().toISOString(),
        ...action.payload,
      });
    },
    dismissNotification: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearAll: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, dismissNotification, clearAll } = notificationsSlice.actions;
export default notificationsSlice.reducer;