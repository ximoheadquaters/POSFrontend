import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import servicesReducer from '../features/services/serviceSlice';
import faqReducer from '../features/faq/faqSlice';
import contactReducer from '../features/contact/contactSlice';
import testimonialsReducer from '../features/testimonials/testimonialsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import uiReducer from '../features/ui/uiSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    faq: faqReducer,
    contact: contactReducer,
    testimonials: testimonialsReducer,
    settings: settingsReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    analytics: analyticsReducer,
  },
  devTools: import.meta.env.DEV,
});