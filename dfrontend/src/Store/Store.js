import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from '../Features/CategorySlice';

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
  },
});