import { createSlice } from '@reduxjs/toolkit';

const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    files: [],
  },
  reducers: {
    setUploads: (state, action) => {
      state.files = action.payload;
    },
  },
});

export const { setUploads } = uploadSlice.actions;
export default uploadSlice.reducer;
