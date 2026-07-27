import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  siteName: 'Ximo',
  tagline: 'Technology Solutions for Business',
  email: 'hello@ximo.com',
  phone: '+1 (555) 123-4567',
  address: '123 Tech Street, San Francisco, CA 94105',
  socialLinks: {
    twitter: '#',
    linkedin: '#',
    github: '#',
  },
  isLoading: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;