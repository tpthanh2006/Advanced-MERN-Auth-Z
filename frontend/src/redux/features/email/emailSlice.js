import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
//import emailService from "./emailService";

const initialState = {
  sendingEmail: false,
  emailSent: false,
  msg: "",
};

// Send Automated Email
export const sendAutomatedEmail = createAsyncThunk(
);

const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    EMAIL_RESET(state) {
      state.sendingEmail = false;
      state.emailSent = false;
      state.msg = "";
    }
  }
});

export const { EMAIL_RESET } = emailSlice.actions;

export default emailSlice.reducer;