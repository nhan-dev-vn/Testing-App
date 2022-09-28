import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { reducer as authReducer } from './authSlice';
import { reducer as audioReducer } from './audioSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  audio: audioReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
  devTools: process.env.NODE_ENV !== 'production'
});
