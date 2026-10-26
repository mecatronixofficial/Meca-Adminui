import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    name: "",
    _id: "",
    email: "",
    role: "",
    phone: "",
    img: "",
  },
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    isLoginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = initialState.user;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { isLoginSuccess, logoutSuccess, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
