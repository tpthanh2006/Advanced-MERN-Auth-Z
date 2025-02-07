import authReducer from "../redux/features/auth/authSlice";
import emailReducer from "../redux/features/email/email";

import { configureStore} from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    email: emailReducer
  }
})