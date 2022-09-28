import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  blob: undefined
};

function setAudioBlob(state, action) {
  state.blob = action.payload;
}

const slice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setAudioBlob,
  }
});

export const reducer = slice.reducer;
export const actions = slice.actions;

export default slice;
