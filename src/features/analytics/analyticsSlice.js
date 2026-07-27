import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pageViews: 0,
  visitors: 0,
  isLoading: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    incrementPageView: (state) => {
      state.pageViews += 1;
    },
    setAnalytics: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { incrementPageView, setAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;