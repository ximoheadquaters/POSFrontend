import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileMenuOpen: false,
  isSidebarOpen: false,
  isModalOpen: false,
  modalContent: null,
  scrollY: 0,
  isScrolled: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalContent = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalContent = null;
    },
    setScrollY: (state, action) => {
      state.scrollY = action.payload;
      state.isScrolled = action.payload > 50;
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleSidebar,
  openModal,
  closeModal,
  setScrollY,
} = uiSlice.actions;

export default uiSlice.reducer;