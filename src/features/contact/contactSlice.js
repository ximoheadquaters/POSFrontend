import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const submitContact = createAsyncThunk(
  'contact/submit',
  async (formData, { rejectWithValue }) => {
    try {
      // Future: const response = await api.post('/contact', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: 'Message sent successfully!' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isSubmitting: false,
  isSuccess: false,
  message: null,
  error: null,
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    resetContact: (state) => {
      state.isSubmitting = false;
      state.isSuccess = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContact.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(submitContact.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { resetContact } = contactSlice.actions;
export default contactSlice.reducer;