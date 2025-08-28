// authSlice.js (Redux Toolkit)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
    },
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});


export const selectCurrentUser = (state) => state.auth.user;
export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;
