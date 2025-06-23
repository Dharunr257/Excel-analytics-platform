import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uploadReducer from './slices/uploadSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    upload: uploadReducer,
  },
});

export default store;
