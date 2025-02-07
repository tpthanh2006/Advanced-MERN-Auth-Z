import authReducer from "../redux/features/auth/authSlice";
import emailReducer from "../redux/features/email/emailSlice";

import { configureStore} from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    email: emailReducer
  }
})