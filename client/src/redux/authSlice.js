import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  loading: true,
  isLoggedIn: false,
  user: {}
};

function loginSuccess(state, action) {
  state.isLoggedIn = true;
  state.loading = false;
  state.user = action.payload;
}

function loginFail(state) {
  state.isLoggedIn = false;
  state.loading = false;
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess,
    loginFail
  }
});

export const reducer = slice.reducer;
export const actions = slice.actions;

export default slice;
