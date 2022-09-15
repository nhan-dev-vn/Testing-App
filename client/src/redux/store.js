import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { reducer as authReducer } from './authSlice';

const rootReducer = combineReducers({
  auth: authReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
  devTools: process.env.NODE_ENV !== 'production'
});
